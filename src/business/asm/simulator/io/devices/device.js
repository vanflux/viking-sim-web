import { EventEmitter } from 'events';

export default class Device extends EventEmitter {
  
  constructor(name) {
    super();
    this.name = name;
    this._waiting = false;
  }

  get waiting() { return this._waiting }
  set waiting(value) {
    if (value === this._waiting) return;
    this._waiting = value;
    this.emit('waiting', value);
  }

  reset() {

  }

  getPorts() {
    return [];
  }
}