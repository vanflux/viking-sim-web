import { Component } from 'react';
import styles from './Control.module.css';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as AssembleIcon } from '../../assets/images/AssembleIcon.svg';
import { ReactComponent as ResetIcon } from '../../assets/images/ResetIcon.svg';
import { ReactComponent as StepIcon } from '../../assets/images/StepIcon.svg';

class Control extends Component {
  constructor(props) {
    super(props);

    this.onAutoAssembleChanged = typeof props.onAutoAssembleChanged === 'function' ? props.onAutoAssembleChanged : ()=>{};
    this.onStepIntervalChanged = typeof props.onStepIntervalChanged === 'function' ? props.onStepIntervalChanged : ()=>{};
    this.onAssemble = typeof props.onAssemble === 'function' ? props.onAssemble : ()=>{};
    this.onRun = typeof props.onRun === 'function' ? props.onRun : ()=>{};
    this.onPause = typeof props.onPause === 'function' ? props.onPause : ()=>{};
    this.onStep = typeof props.onStep === 'function' ? props.onStep : ()=>{};
    this.onReset = typeof props.onReset === 'function' ? props.onReset : ()=>{};

    this.cycles = 0;
    this.stepInterval = 50;
    this.autoAssemble = true;

    this.state = {  }
  }

  setCycles(cycles) {
    this.cycles = cycles;
    this.setState({});
  }

  stepIntervalChanged(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;
    if (value > 1000) value = 1000;
    this.stepInterval = value;
    this.onStepIntervalChanged(this.stepInterval);
    this.setState({});
  }

  autoAssembleChanged(e) {
    this.autoAssemble = e.target.checked;
    this.onAutoAssembleChanged(this.autoAssemble);
    this.setState({});
  }

  async assembleClick() {
    await this.onAssemble();
  }
  
  async resetClick() {
    await this.onReset();
  }
  
  async stopClick() {
    await this.onPause();
  }
  
  async runClick() {
    await this.onRun();
  }
  
  async stepClick() {
    await this.onStep();
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
            <div>{this.cycles}</div>
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
          <input
            className={styles.delayInput}
            type='number'
            value={this.stepInterval}
            onChange={this.stepIntervalChanged.bind(this)}
            onKeyUp={this.stepIntervalChanged.bind(this)}
            min="0"
            max="1000" />
        </div>
      </div>
    );
  }
}
 
export default Control;