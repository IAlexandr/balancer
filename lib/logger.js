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
        .then(amqpConn => {
          debug('amqp connected.');
          return resolve(amqpConn);
        });
    });
  });
}

export default function () {
  debug('Initializing.');
  getAmqp()
    .then(amqpConn => {
      listen({ amqpConn })
        .then(() => {
          debug('Initialized.');
        });
    })
    .catch(err => {
      debug(err.message);
    });
}

const defaultConsumeFunc = (msg) => {
  debug(" [x] %s: '%s'", msg.fields.routingKey, prepContent(msg.content.toString()));
};

function listen ({ amqpConn }) {
  return Promise.all([
    toEx({ exchange: 'registrator', keys: ['#'], amqpConn, consumeFunc: defaultConsumeFunc }),
  ]);
}

function toEx ({ amqpConn, exchange, keys, consumeFunc }) {
  return amqpConn.createChannel()
    .then(ch => {
      return ch.assertExchange(exchange, 'topic', { durable: true })
        .then(() => ch.assertQueue('', { exclusive: true }))
        .then(q => {
          return Promise.all(keys.map((key) => {
            return ch.bindQueue(q.queue, exchange, key);
          }))
            .then(() => {
              return ch;
            });
        })
        .then(q => {
          return ch.consume(q.queue, consumeFunc, { noAck: true });
        })
    });
}

function prepContent (content) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch (e) {
    return content;
  }
}