import Bletcd from 'bletcd';
import async from 'async';
import dg from 'debug';
const debug = dg('balancer:etcd');
import options from './../options';
var etcd = new Bletcd({ url: options.ETCD_CONN });

export function getConnNode (connItem) {
  return (props, callback) => {
    etcd.get(`/connections/${connItem}`, (err, response) => {
      if (err) {
        return callback(err);
      }
      if (response) {
        if (response.errorCode && response.errorCode === 100) {
          return callback(new Error(`(ETCD) connections / ${connItem} not found.`));
        }
        props[connItem] = getEtcdRespValue(response.node.value);
        return callback(null, props);
      } else {
        return callback(new Error(`(ETCD) connections / ${connItem} not found.`));
      }
    });
  }
}

export default function (props = {}) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      function (callback) {
        return callback(null, props);
      },
      getConnNode('amqp'),
      getConnNode('db'),
      getConnNode('s3'),
    ], (err, connectionsInfo) => {
      if (err) {
        return reject(err);
      }
      debug('connected.');
      return resolve({ connectionsInfo, connections: { etcd } });
    });
  });
}


// получение наименование ключа (например sysm_id2 в пути etcd 'components/sysms/sysm_id2')
export function getEtcdRespKeyName (key) {
  const subkeys = key.split('/');
  if (subkeys.length > 0) {
    return subkeys[subkeys.length - 1];
  } else {
    throw new Error(`getKeyName err: keyString: (${key}).`);
  }
}

export function getEtcdRespValue (respValue) {
  let value;
  try {
    value = JSON.parse(respValue);
  } catch (e) {
    value = respValue;
  }
  return value;
}

export function prepEtcdResponse (response) {
  function prepResultObject (nodeItem) {
    return { [getEtcdRespKeyName(nodeItem.key)]: getEtcdRespValue(nodeItem.value) }
  }

  const node = response.node;
  if (node.dir) {
    if (node.hasOwnProperty('nodes')) {
      return node.nodes.reduce((v, nodeItem) => {
        return { ...v, ...prepResultObject(nodeItem) };
      }, {});
    } else {
      return {};
    }
  } else {
    return prepResultObject(node);
  }
}

export function getEtcdValueByPath (pth) {
  return new Promise((resolve, reject) => {
    etcd.get(pth, (err, response) => {
      if (err) {
        debug(`etcd.get(${pth}) err`);
        return reject(err);
      }
      return resolve(prepEtcdResponse(response));
    });
  });
}

export function watcher (pth, onErr, onChange) {
  const watcher = etcd.watcher(pth, { recursive: true });

  watcher.on('error', function (err) {
    debug(`${pth} Watch error:`, err);
    watcher.stop();
    onErr(err);
  });
  watcher.on('change', function (op) {
    // debug(`${pth} Notified of change`);
    onChange(op);
  });

  return watcher;
}

export function setKey (pth, value, options = {}) {
  return new Promise((resolve, reject) => {
    etcd.put(pth, value, options, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}
