import { EventEmitter } from 'events';

export default class Port extends EventEmitter {
  constructor(name, readHandler, writeHandler, device) {
    super();
    this.name = name;
    this.waitingRead = false;
    this.waitingWrite = false;
    this.readHandler = readHandler ? readHandler : ()=>0;
    this.writeHandler = writeHandler ? writeHandler : ()=>null;
    this.device = device;
  }

  reset() {
    this.waitingRead = false;
    this.waitingWrite = false;
  }

  read(simulation) {
    return this.readHandler(simulation);
  }
  
  write(simulation, value) {
    return this.writeHandler(simulation, value);
  }

  endReadWaiting() {
    this.waitingRead = false;
    this.emit('read wait end');
  }
  
  endWriteWaiting() {
    this.waitingWrite = false;
    this.emit('write wait end');
  }
}