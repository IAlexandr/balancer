import Monitor from './monitor';
import options from './../options';

export default class extends Monitor {
  constructor () {
    super({
      name: 'SYSMS',
      pth: options.SYSMS
    });

    this.on('op', (op) => {
    });

    this.on('set', this.onSet);
    this.on('delete', this.onExpire);
    this.on('expire', this.onExpire);
  }

  onSet (op) {
    this.debug('onSet', op);
  }

  onExpire (op) {
    this.debug('onExpire', op);
  }

  init () {
    return new Promise((resolve, reject) => {
      this.getList()
        .then(sysms => {
          this.sysms = sysms;
          this.watch();
          return resolve({ sysmsWatcher: 'ok' });
        });
    });
  }
}