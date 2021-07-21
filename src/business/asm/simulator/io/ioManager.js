export default class IOManager {
  constructor(simulation) {
    this.simulation = simulation;
    this.ports = [];
    this.portHandlers = [];
    this.waitingPort = null;
  }

  reset() {
    this.ports.forEach(port => port.reset());
  }

  getPorts() {
    return this.ports;
  }

  addPort(port) {
    this.ports.push(port);

    let answerHandler = () => {
      if (!this.simulation.waitingIO) return;
      if (this.waitingPort !== port) return;
      this.simulation.waitingIO = false;
      this.simulation.run();
    };

    port.on('read wait end', answerHandler);
    port.on('write wait end', answerHandler);

    this.portHandlers.push({answerHandler});
  }

  removePort(port) {
    let index = this.ports.findIndex(x => x === port);
    if (index < 0) return;
    this.ports.splice(index, 1);
    let handlers = this.portHandlers[index];
    this.portHandlers.splice(index, 1);
    port.off('read answer', handlers.answerHandler);
    port.off('write answer', handlers.answerHandler);
  }

  read(index) {
    if (index >= this.ports.length) throw new Error('Inexistent IO port');
    let result = this.ports[index].read(this.simulation);
    if (this.ports[index].waitingRead) {
      this.waitingPort = this.ports[index];
      this.simulation.waitingIO = true;
    }
    return result;
  }

  write(index, value) {
    if (index >= this.ports.length) throw new Error('Inexistent IO port');
    let result = this.ports[index].write(this.simulation, value);
    if (this.ports[index].waitingWrite) {
      this.waitingPort = this.ports[index];
      this.simulation.waitingIO = true;
    }
    return result;
  }
}