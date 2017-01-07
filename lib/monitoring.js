import dg from 'debug';
const debug = dg('balancer:monitoring');
import SysmsMonitor from './sysms-monitor';

export default function () {
  const sysmsWatcher = new SysmsMonitor();

  Promise.all([
    sysmsWatcher.init()
  ])
    .then(res => {
      debug(res);
    })
    .catch(err => {
      debug('err', err.message);
    });
}
