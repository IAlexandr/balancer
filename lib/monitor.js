import {watcher, getEtcdValueByPath} from './etcd';
import dg from 'debug';
import EventEmitter from 'events';

export default class extends EventEmitter {
  constructor ({ pth, name }) {
    super();
    this.pth = pth;
    this.name = name;
    this.debug = dg(`balancer:monitor:${name}`);
  }

  onChange (op) {
    this.debug('onChange', op.action);
    this.emit(op.action, op);
  }

  onErr (err) {
    this.debug('onErr', err.message);
    // TODO save log
    this.emit('on_err', err);
  }

  watch () {
    this.debug(`start watching ${this.pth}`);
    this.watcher = watcher(this.pth, this.onErr.bind(this), this.onChange.bind(this));
  }

  getList () {
    return getEtcdValueByPath(this.pth);
  }
}

