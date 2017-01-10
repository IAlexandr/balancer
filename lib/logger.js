import {listenTo, parseContent, prepContent} from './amqp';
import dg from 'debug';
const debug = dg('balancer:logger');

export default function () {
  debug('Initializing.');
  listen()
    .then(() => {
      debug('Initialized.');
    })
    .catch(err => {
      debug(err.message);
    });
}


function listen () {
  // тут подключаем все, что нужно слушать.
  return listenTo({
    exProps: {
      name: 'balancer',
      type: 'topic',
      options: { durable: true }
    },
    qProps: {
      name: 'log',
      options: { exclusive:true, durable: true }
    },
    keys: ['#'],
    consumeFunc: defaultConsumeFunc
  });
}

const defaultConsumeFunc = (msg) => {
  debug(" [x] %s: '%s'", msg.fields.routingKey, prepContent(msg.content.toString()));
};
