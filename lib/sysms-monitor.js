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
    this.checkSysmsTo = null;
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
    return publishTo({ exName, key, msg, options });
  };

  checkSysms () {
    const _this = this;

    if (_this.checkSysmsTo) {
      clearTimeout(_this.checkSysmsTo);
    }

    return new Promise((resolve, reject) => {
      _this.checkSysmsTo = setTimeout(() => {
        _this.checking()
          .then(() => {
            return resolve();
          })
          .catch(err => {
            this.debug('(checkSysms) err:', err.message);
            return reject(err);
          });
      }, 3000);
    });
  }

  checking () {
    return this.updateSysmsList()
      .then(sysms => {
        this.sysms = sysms;
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
          this.sysms[applicant.sysmId].isMaster = true;
          return this.publishMaster(applicant);
        } else {
          return 0;
        }
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
        .then(sysms => {
          this.sysms = sysms;
          return this.checking();
        })
        .then(() => {
          this.watch();
          return resolve({ sysmsWatcher: 'ok' });
        });
    })
  }
}