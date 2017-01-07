import {getConnNode} from './etcd';
import amqplib from 'amqplib';
import dg from 'debug';
const debug = dg('balancer:logger');

function getAmqp () {
  return new Promise((resolve, reject) => {
    debug('get amqp connection options');
    getConnNode('amqp')({}, (err, props) => {
      if (err) {
        return reject(err);
      }
      debug('amqp connecting..');
      amqplib.connect(`amqp://${props.amqp.url}`)
        .then(amqp => {
          debug('amqp connected.');
          return resolve(amqp);
        });
    });
  });
}

export default function () {
  debug('Initializing.');
  getAmqp()
    .then(amqp => {
      // TODO
      debug('Initialized.');
    })
    .catch(err => {
      debug(err.message);
    });
}


