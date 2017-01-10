import dg from 'debug';
const debug = dg('balancer:monitoring');
import SysmsMonitor from './sysms-monitor';

export default function () {
  const sysmsWatcher = new SysmsMonitor();
  debug('Initializing..');
  return Promise.all([
    sysmsWatcher.init()
  ])
    .then(() => {
      debug('Initialized.');
      return 0;
    });
}
