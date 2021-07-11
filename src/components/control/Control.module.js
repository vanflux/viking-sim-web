import { Component } from 'react';
import utils from '../../utils';
import styles from './Control.module.css';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as AssembleIcon } from '../../assets/images/AssembleIcon.svg';
import { ReactComponent as ResetIcon } from '../../assets/images/ResetIcon.svg';
import { ReactComponent as StepIcon } from '../../assets/images/StepIcon.svg';

class Control extends Component {
  constructor(props) {
    super(props);

    if (!props.simulation) throw new Error('props.simulation null');

    this.simulation = props.simulation;

    this.onAutoAssembleChanged = typeof props.onAutoAssembleChanged === 'function' ? props.onAutoAssembleChanged : ()=>{};
    this.onAssemble = typeof props.onAssemble === 'function' ? props.onAssemble : ()=>{};
    this.onBeforeRun = typeof props.onBeforeRun === 'function' ? props.onBeforeRun : ()=>{};
    this.onError = typeof props.onError === 'function' ? props.onError : ()=>{};

    this.autoAssemble = true;

    this.state = {  }
  }

  componentDidMount() {
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
    if (isNaN(value)) value = 0;
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
    try {
      if (await this.onBeforeRun() === false) return;
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

  autoAssembleChanged(e) {
    this.autoAssemble = e.target.checked;
    this.onAutoAssembleChanged(this.autoAssemble);
    this.setState({});
  }

  getAutoAssemble() {
    return this.autoAssemble;
  }

  render() { 
    return (
      <div className={`unselectable ${styles.container}`}>
        <div className={styles.title}>Control</div>

        <div className={styles.content}>
          <div className={styles.cycleArea}>
            <div className={styles.cycleLabel}>Cycle:</div>
            <div>{this.simulation.getCycles()}</div>
          </div>
          
          <div>
            <input
              type="checkbox"
              checked={this.autoAssemble}
              onChange={this.autoAssembleChanged.bind(this)}
            /><span style={{margin: '0px 0px 0px 5px'}}>Auto-assemble</span>
          </div>

          <div className={styles.btnList}>
            <div className={styles.btn} onClick={this.assembleClick.bind(this)}>
              <div className={styles.btnLaterals}></div>
              <AssembleIcon className="MuiSvgIcon-root" />
              <div>Assemble</div>
              <div className={styles.btnLaterals}></div>
            </div>
            <div className={styles.btn} onClick={this.runClick.bind(this)}>
              <div className={styles.btnLaterals}></div>
              <PlayCircleFilledIcon />
              <div>Run</div>
              <div className={styles.btnLaterals}></div>
            </div>
            <div className={styles.btn} onClick={this.stopClick.bind(this)}>
              <div className={styles.btnLaterals}></div>
              <PauseCircleFilledIcon />
              <div>Pause</div>
              <div className={styles.btnLaterals}></div>
            </div>
            <div className={styles.btn} onClick={this.stepClick.bind(this)}>
              <div className={styles.btnLaterals}></div>
              <StepIcon className="MuiSvgIcon-root" />
              <div>Step</div>
              <div className={styles.btnLaterals}></div>
            </div>
            <div className={styles.btn} onClick={this.resetClick.bind(this)}>
              <div className={styles.btnLaterals}></div>
              <ResetIcon className="MuiSvgIcon-root" />
              <div>Reset</div>
              <div className={styles.btnLaterals}></div>
            </div>
          </div>

          <div className={styles.delayLabel}>Delay (ms):</div>
          <input className={styles.delayInput} type='number' value={this.simulation.getStepInterval()} onChange={this.stepIntervalChanged.bind(this)} min="0" max="1000" />
        </div>
      </div>
    );
  }
}
 
export default Control;