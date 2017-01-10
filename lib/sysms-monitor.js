import Monitor from './monitor';
import options from './../options';
import {publishTo} from './amqp';

export default class extends Monitor {
  constructor () {
    super({
      name: 'SYSMS',
      pth: options.SYSMS
    });
    this.sysms = {};
    this.on('set', this.onSet);
    this.on('delete', this.onExpire);
    this.on('expire', this.onExpire);
  };

  sysmIdCheckExists (sysmId) {
    return this.sysms.hasOwnProperty(sysmId);
  }

  onSet (key, op) {
    // this.debug('onSet', key, op);
    if (!this.sysmIdCheckExists(key)) {
      this.checkSysms();
    }
  };

  onExpire (key, op) {
    this.debug('onExpire', key, op);
    this.checkSysms();
  };

  publishMaster ({ sysmId }) {
    const exName = 'main';
    const key = `sysms.${sysmId}`;
    const msg = JSON.stringify({ isMaster: true });
    const options = { noAck: true, type: 'setMaster' };
    return publishTo({exName, key, msg, options });
  };

  checkSysms () {
    return this.updateSysmsList()
      .then(sysms => {
        const sysmsIds = Object.keys(sysms);
        if (!sysmsIds.length) {
          // TODO сообщение администратору об отсутствии sysms! Принять решение поднять VM-SYSM
          return 0;
        }
        const sysm_master = sysmsIds.filter((sysmId) => {
          return sysms[sysmId].isMaster;
        });
        if (!sysm_master.length) {
          const applicant = sysmsIds.reduce((v, sysmId) => {
            if (sysms[sysmId].masterLevel < v.masterLevel) {
              return { ...sysms[sysmId], ...{ sysmId } }
            }
            return { ...v, ...{ sysmId } };
          }, { masterLevel: 100000000 });
          return this.publishMaster(applicant);
        } else {
          return 0;
        }
      })
      .catch(err => {
        this.debug('(checkSysms) err:', err.message);
      });
  }

  updateSysmsList () {
    return this.getList()
      .then(sysms => {
        this.sysms = sysms;
        return sysms;
      });
  }

  init () {
    return new Promise((resolve, reject) => {
      this.updateSysmsList()
        .then(sysms => this.checkSysms())
        .then(() => {
          this.watch();
          return resolve({ sysmsWatcher: 'ok' });
        });
    })
  }
}