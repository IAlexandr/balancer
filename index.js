// TODO запуск пингеров по сервисам (etcd, s3, rabbitmq, pg)
// TODO модуль поднятия новых виртуальных машин.
// TODO журналирование

import dg from 'debug';
const debug = dg('balancer');
import logger from './lib/logger';

debug('Initializing.');
logger();
