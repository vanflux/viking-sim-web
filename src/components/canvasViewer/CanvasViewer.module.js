import { Component, createRef } from 'react';
import styles from './CanvasViewer.module.css';

const fillColor = '#111111'
const clearColor = '#dddddd'

class CanvasViewer extends Component {
  constructor(props) {
    super(props);

    if (!props.canvasDevice) throw new Error('props.canvasDevice null');

    this.canvasDevice = props.canvasDevice;
    
    this.canvasRef = createRef();

    this.state = {  }
  }

  componentDidMount() {
    this.ctx = this.canvasRef.current.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.width = this.canvasRef.current.width;
    this.height = this.canvasRef.current.width;

    this.resetHandler = this.reset.bind(this);
    
    this.clearHandler = () => {
      this.ctx.fillStyle = clearColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    };

    this.drawPixelHandler = (x, y) => {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(x, y, 1, 1);
    }
    
    this.clearPixelHandler = (x, y) => {
      this.ctx.fillStyle = clearColor;
      this.ctx.fillRect(x, y, 1, 1);
    }
    
    this.drawLineHandler = (x0, y0, x1, y1) => {
      this.ctx.fillStyle = fillColor;
      lineAlg(x0, y0, x1, y1, (x, y)=>this.ctx.fillRect(x, y, 1, 1));
    }
    
    this.clearLineHandler = (x0, y0, x1, y1) => {
      this.ctx.fillStyle = clearColor;
      lineAlg(x0, y0, x1, y1, (x, y)=>this.ctx.fillRect(x, y, 1, 1));
    }

    function lineAlg(x0, y0, x1, y1, onpixel) {
      let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; 
      let err = (dx>dy ? dx : -dy)/2;        
      while (true) {
        onpixel(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        let e2 = err;
        if (e2 > -dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
      }
    }

    this.canvasDevice.on('draw pixel', this.drawPixelHandler);
    this.canvasDevice.on('clear pixel', this.clearPixelHandler);
    this.canvasDevice.on('draw line', this.drawLineHandler);
    this.canvasDevice.on('clear line', this.clearLineHandler);
    this.canvasDevice.on('reset', this.resetHandler);
    this.canvasDevice.on('clear', this.clearHandler);

    this.reset();
  }

  componentWillUnmount() {
    this.canvasDevice.off('draw pixel', this.drawPixelHandler);
    this.canvasDevice.off('clear pixel', this.clearPixelHandler);
    this.canvasDevice.off('draw line', this.drawLineHandler);
    this.canvasDevice.off('clear line', this.clearLineHandler);
    this.canvasDevice.off('reset', this.resetHandler);
    this.canvasDevice.off('clear', this.clearHandler);
  }

  reset() {
    this.ctx.fillStyle = clearColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.titleContainer}>Canvas<div className={styles.new}>new</div></div>
        <div className={styles.canvasContainer}>
          <canvas width="16" height="16" className={styles.canvas} ref={this.canvasRef} />
        </div>
      </div>
    );
  }
}
 
export default CanvasViewer;