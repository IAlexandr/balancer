// TODO запуск пингеров по сервисам (etcd, s3, rabbitmq, pg)
// TODO модуль поднятия новых виртуальных машин.
// TODO журналирование

import dg from 'debug';
const debug = dg('balancer');
import logger from './lib/logger';
import monitoring from './lib/monitoring';

debug('Initializing.');
monitoring();
logger();
