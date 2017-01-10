// TODO запуск пингеров по сервисам (etcd, s3, rabbitmq, pg)
// TODO модуль поднятия новых виртуальных машин.
// TODO журналирование

import dg from 'debug';
const debug = dg('balancer');
import logger from './lib/logger';
import monitoring from './lib/monitoring';
import {init as amqpInit} from './lib/amqp';


debug('Initializing.');
amqpInit()
  .then(() => Promise.all([
    monitoring(),
    logger()
  ]))
  .then(() => debug('Initialized.'))
  .catch(err => debug(err.message))
