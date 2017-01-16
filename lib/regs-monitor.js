import Monitor from './monitor';
import options from './../options';

export default class extends Monitor {
  constructor () {
    super({
      name: 'REGISTRATORS',
      pth: options.REGISTRATORS
    });
    this.regs = {};
    this.on('set', this.onSet);
    this.on('delete', this.onExpire);
    this.on('expire', this.onExpire);
  };

  regIdCheckExists (regId) {
    return this.regs.hasOwnProperty(regId);
  }

  onSet (key, op) {
    // this.debug('onSet', key, op);
    if (!this.regIdCheckExists(key)) {
      this.checkRegs();
    }
  };

  onExpire (key, op) {
    this.debug('onExpire', key, op);
    this.checkRegs();
  };

  checkRegs () {
    return this.updateRegsList()
      .then(regs => {
        const regsIds = Object.keys(regs);
        if (!regsIds.length) {
          // TODO сообщение администратору об отсутствии regs! Принять решение поднять VM-SYSM
          return 0;
        }
        return regs;
      })
      .catch(err => {
        this.debug('(checkSysms) err:', err.message);
      });
  }

  updateRegsList () {
    return this.getList()
      .then(regs => {
        this.regs = regs;
        return regs;
      });
  }

  init () {
    return new Promise((resolve, reject) => {
      this.updateRegsList()
        .then(regs => this.checkRegs())
        .then(() => {
          this.watch();
          return resolve({ regsWatcher: 'ok' });
        });
    })
  }
}
