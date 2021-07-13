import { Component, createRef } from "react";
import styles from './Console.module.css';

class Console extends Component {
  constructor(props) {
    super(props);
    
    this.onInput = typeof props.onInput === 'function' ? props.onInput : ()=>{};

    this.inputRef = createRef();
    this.outputRef = createRef();

    this.state = {
      inputAlert: false,
      inputBuffer: Buffer.from([]),
    };
  }

  setInputAlert(inputAlert) {
    this.setState({inputAlert});
    if (inputAlert) {
      this.inputRef.current.focus();
    }
  }

  setInputBuffer(inputBuffer) {
    this.setState({inputBuffer});
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
            <textarea readOnly spellCheck='false' value={this.state.inputBuffer.map(x => x.toString(16).padStart(2, '0')).join(' ')}></textarea>
          </div>
        </div>
        <input
          className={(this.state.inputAlert ? (styles.alertsOutline + ' ') : '') + styles.inputText}
          placeholder="input..."
          id='inputText'
          onKeyDown={this.inputKeyDown.bind(this)}
          ref={this.inputRef} />
      </div>
    );
  }
}
 
export default Console;