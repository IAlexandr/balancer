const version = require('./package.json').version;
const optionsSpec = {
  PORT: {
    required: true,
    default: '4567',
    env: 'BALANCER_PORT'
  },
  ETCD_CONN: {
    required: true,
    default: 'http://10.157.212.14:2379',
    env: 'BALANCER_ETCD_CONN'
  },
  RESTART_TO: {
    required: true,
    default: '10000', // ms
    env: 'BALANCER_RESTART_TO'
  },
  PROOF_ALIVE_TO: {
    required: true,
    default: '15000', // ms
    env: 'BALANCER_PROOF_ALIVE_TO'
  },
  CHECK_SYSMS_TO: {
    required: true,
    default: '15000', // ms
    env: 'BALANCER_CHECK_SYSMS_TO'
  },
  BALANCER_ID: {
    required: true,
    default: 'balancer_id1',
    env: 'BALANCER_ID'
  },
  IS_MASTER: {
    required: true,
    default: 'false',
    env: 'BALANCER_IS_MASTER'
  },
  SYSMS: {
    required: true,
    default: 'components/sysms',
    env: 'BALANCER_SYSMS_ETCD_PATH'
  },
  BALANCERS: {
    required: true,
    default: 'components/balancers',
    env: 'BALANCER_BALANCERS_ETCD_PATH'
  },
  REGISTRATORS: {
    required: true,
    default: 'components/registrators',
    env: 'BALANCER_REGISTRATORS_ETCD_PATH'
  }
};

let options = {
  version
};

const op = {
  ...options, ...Object.keys(optionsSpec).map((key) => {
    if (!optionsSpec[key].preprocess) {
      optionsSpec[key].preprocess = function preprocess (str) {
        return str;
      };
    }
    const opt = { name: key };
    if (process.env[optionsSpec[key].env]) {
      opt.value = optionsSpec[key].preprocess(process.env[optionsSpec[key].env]);
    } else if (optionsSpec[key].default) {
      opt.value = optionsSpec[key].preprocess(optionsSpec[key].default);
    } else if (optionsSpec[key].required) {
      throw new Error('!!! REQUIRED OPTION NOT SET: ' + key);
    }
    return opt;
  }).reduce((prev, cur) => {
    prev[cur.name] = cur.value;
    return prev;
  }, {})
};

export default op;
