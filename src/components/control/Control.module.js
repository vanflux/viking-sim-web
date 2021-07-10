import { Component } from 'react';
import utils from '../../utils';
import styles from './Control.module.css';

class Control extends Component {
  constructor(props) {
    super(props);

    this.simulation = props.simulation;
    this.onAssemble = typeof props.onAssemble === 'function' ? props.onAssemble : ()=>{};
    this.onError = typeof props.onError === 'function' ? props.onError : ()=>{};

    this.state = {  }
  }

  componentWillMount() {
    this.cyclesUpdateHandler = utils.callLimiter((cycles) => {
      this.setState({});
    }, 50);
    this.simulation.on('cycles update', this.cyclesUpdateHandler);
  }

  componentWillUnmount() {
    this.simulation.off('cycles update', this.cyclesUpdateHandler);
  }

  stepIntervalChanged(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 50;
    this.simulation.setStepInterval(value);
    this.setState({});
  }

  async assembleClick() {
    await this.onAssemble();
  }
  
  async resetClick() {
    try {
      await this.simulation.reset();
    } catch (exc) {
      this.onError(exc);
    }
  }
  
  async stopClick() {
    try {
      await this.simulation.stop();
    } catch (exc) {
      this.onError(exc);
    }
  }
  
  async runClick() {
    await this.callH
    try {
      await this.simulation.run();
    } catch (exc) {
      this.onError(exc);
    }
  }
  
  async stepClick() {
    try {
      await this.simulation.step();
    } catch (exc) {
      this.onError(exc);
    }
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Control</div>

        <div className={styles.content}>
          <div className={styles.cycleArea}>
            <div className={styles.cycleLabel}>Cycle:</div>
            <div>{this.simulation.getCycles()}</div>
          </div>
          
          <button className={styles.btn} onClick={this.assembleClick.bind(this)}>Assemble</button>
          <button className={styles.btn} onClick={this.resetClick.bind(this)}>Reset</button>
          <button className={styles.btn} onClick={this.stopClick.bind(this)}>Stop</button>
          <button className={styles.btn} onClick={this.runClick.bind(this)}>Run</button>
          <button className={styles.btn} onClick={this.stepClick.bind(this)}>Step</button>

          <div className={styles.delayLabel}>Delay (ms):</div>
          <input className={styles.delayInput} type='number' value={this.simulation.getStepInterval()} onChange={this.stepIntervalChanged.bind(this)} min="0" max="1000" />
        </div>
      </div>
    );
  }
}
 
export default Control;