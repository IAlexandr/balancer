import {getConnNode} from './etcd';
import amqplib from 'amqplib';
import dg from 'debug';
const debug = dg('balancer:amqp');

let amqpConn;
export function getAmqp () {
  return new Promise((resolve, reject) => {
    if (amqpConn) {
      return resolve(amqpConn);
    }
    debug('get amqp connection options');
    getConnNode('amqp')({}, (err, props) => {
      if (err) {
        return reject(err);
      }
      debug('amqp connecting..');
      amqplib.connect(`amqp://${props.amqp.url}`)
        .then(amqp => {
          debug('amqp connected.');
          amqpConn = amqp;
          return resolve(amqpConn);
        });
    });
  });
}

export function listenTo ({ exProps, qProps, keys, consumeFunc, consumeOptions = { noAck: true } }) {
  const props = {
    exProps: exProps,
    qProps: qProps,
    keys,
    consumeOptions
  };
  return getAmqp()
    .then(amqpConn => amqpConn.createChannel())
    .then(ch => {
      props.ch = ch;
      return props.ch.assertExchange(exProps.name, exProps.type, exProps.options)
        .then(() => ch.assertQueue(qProps.name, qProps.options))
        .then(q => {
          props.q = q;
          return Promise.all(keys.map(key => {
            return ch.bindQueue(q.queue, exProps.name, key);
          }));
        })
        .then(() => {
          props.ch.consume(props.q.queue, consumeFunc, consumeOptions);
          return props;
        });
    });
}


export function prepContent (content) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch (e) {
    return content;
  }
}


export function parseContent (content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    return content;
  }
}
