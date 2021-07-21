import Port from '../port';
import Device from './device';

export default class CanvasDevice extends Device {
  constructor() {
    super('canvas');

    this.x = 0;
    this.y = 0;
    this.p1X = 0;
    this.p1Y = 0;
    this.p2X = 0;
    this.p2Y = 0;

    this.setXPort = new Port('setX', null, this.setX.bind(this), this);
    this.setYPort = new Port('setY', null, this.setY.bind(this), this);
    this.drawPixelPort = new Port('drawPixel', null, this.drawPixel.bind(this), this);
    this.clearPixelPort = new Port('clearPixel', null, this.clearPixel.bind(this), this);
    this.setP1Port = new Port('setP1', null, this.setP1.bind(this), this);
    this.setP2Port = new Port('setP2', null, this.setP2.bind(this), this);
    this.drawLinePort = new Port('drawLine', null, this.drawLine.bind(this), this);
    this.clearLinePort = new Port('clearLine', null, this.clearLine.bind(this), this);
    this.clearPort = new Port('clear', null, this.clear.bind(this), this);

    this.ports = [
      this.setXPort,
      this.setYPort,
      this.drawPixelPort,
      this.clearPixelPort,
      this.setP1Port,
      this.setP2Port,
      this.drawLinePort,
      this.clearLinePort,
      this.clearPort,
    ];
  }

  setX(simulation, value) {
    this.x = value;
  }
  
  setY(simulation, value) {
    this.y = value;
  }

  drawPixel(simulation, value) {
    this.emit('draw pixel', this.x, this.y);
  }
  
  clearPixel(simulation, value) {
    this.emit('clear pixel', this.x, this.y);
  }

  setP1(simulation, value) {
    this.p1X = this.x;
    this.p1Y = this.y;
  }
  
  setP2(simulation, value) {
    this.p2X = this.x;
    this.p2Y = this.y;
  }

  drawLine(simulation, value) {
    this.emit('draw line', this.p1X, this.p1Y, this.p2X, this.p2Y);
  }
  
  clearLine(simulation, value) {
    this.emit('clear line', this.p1X, this.p1Y, this.p2X, this.p2Y);
  }

  clear(simulation, value) {
    this.emit('clear');
  }
  
  reset() {
    this.emit('reset');
  }

  getPorts() {
    return this.ports;
  }
}