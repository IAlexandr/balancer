import dg from 'debug';
const debug = dg('balancer:monitoring');
import SysmsMonitor from './sysms-monitor';
import RegsMonitor from './regs-monitor';

export default function () {
  const sysmsWatcher = new SysmsMonitor();
  const regsWatcher = new RegsMonitor();
  debug('Initializing..');
  return Promise.all([
    sysmsWatcher.init(),
    regsWatcher.init(),
  ])
    .then(() => {
      debug('Initialized.');
      return 0;
    });
}
