import {consumeTo, checkBindAndConsumeTo, prepContent} from './amqp';
import dg from 'debug';
const debug = dg('balancer:logger');

export default function () {
  debug('Initializing.');
  return listen()
    .then(() => {
      debug('Initialized.');
      return 0;
    });
}

function listen () {
  // тут подключаем все, что нужно слушать.
  return Promise.all([
    consumeTo('log', defaultConsumeFunc),
    // checkBindAndConsumeTo({
    //   exProps: {
    //     name: 'main',
    //     type: 'topic',
    //     options: { durable: true }
    //   },
    //   qProps: {
    //     name: `log.#`,
    //     options: { exclusive: true }
    //   },
    //   keys: [`log.#`],
    //   consumeFunc: defaultConsumeFunc
    // })
  ]);
}

const defaultConsumeFunc = (msg) => {
  debug(" [x] %s: '%s'", msg.fields.routingKey, prepContent(msg.content.toString()));
};
