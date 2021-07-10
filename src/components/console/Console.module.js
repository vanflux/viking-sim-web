import { Component, createRef } from "react";
import styles from './Console.module.css';

class Console extends Component {
  constructor(props) {
    super(props);

    if (!props.simulation) throw new Error('props.simulation null');
    
    this.simulation = props.simulation;
    this.onInput = typeof props.onInput === 'function' ? props.onInput : ()=>{};
    this.outputRef = createRef();

    this.state = {  }
  }

  componentDidMount() {
    this.simulationInBufHandler = (inputBuffer) => {
      this.setInputBuffer(inputBuffer);
    };

    this.simulation.on('input buffer', this.simulationInBufHandler);
  }

  componentWillUnmount() {
    this.simulation.off('input buffer', this.simulationInBufHandler);
  }

  setInputBuffer(inputBuffer) {
    this.setState({});
  }

  write(text) {
    this.outputRef.current.value += text;
    this.outputRef.current.scrollTop = this.outputRef.current.scrollHeight;
  }

  writeLine(text) {
    this.outputRef.current.value += text + '\n';
    this.outputRef.current.scrollTop = this.outputRef.current.scrollHeight;
  }

  inputKeyDown(e) {
    if (e.key.toLowerCase() === 'enter') {
      let text = e.target.value;
      if (text.length > 0) {
        e.target.value = '';
        this.onInput(text);
      }
    }
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.outAndInBufContainer}>
          <div className={styles.output}>
            <textarea readOnly spellCheck='false' ref={this.outputRef}></textarea>
          </div>
          <div className={styles.inputBuffer}>
            <div className={styles.title}>Input Buffer</div>
            <textarea readOnly spellCheck='false' value={this.simulation.getInput().map(x => x.toString(16).padStart(2, '0')).join(' ')}></textarea>
          </div>
        </div>
        <input className={styles.inputText} placeholder="input..." id='inputText' onKeyDown={this.inputKeyDown.bind(this)}/>
      </div>
    );
  }
}
 
export default Console;