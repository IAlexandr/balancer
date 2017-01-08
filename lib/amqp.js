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