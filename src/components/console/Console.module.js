import { Component, createRef } from "react";
import styles from './Console.module.css';

class Console extends Component {
  constructor(props) {
    super(props);
    
    if (!props.consoleDevice) throw new Error('props.consoleDevice null');

    this.consoleDevice = props.consoleDevice;

    this.onInput = typeof props.onInput === 'function' ? props.onInput : ()=>{};

    this.inputRef = createRef();
    this.outputRef = createRef();

    this.isNewLine = true;
    this.lastNode = null;
    this.lastType = 0;

    this.state = {
      inputBuffer: [],
      waiting: false,
    };
  }

  componentDidMount() {
    this.inputBufferHandler = (inputBuffer) => {
      this.setState({inputBuffer});
    };
    this.waitingHandler = (waiting) => {
      this.inputRef.current.focus();
      this.setState({waiting});
    };
    this.writeCharHandler = (char) => {
      this.write(char);
    };
    this.writeIntHandler = (int) => {
      this.write(int);
    };

    this.consoleDevice.on('input buffer', this.inputBufferHandler);
    this.consoleDevice.on('waiting', this.waitingHandler);
    this.consoleDevice.on('write char', this.writeCharHandler);
    this.consoleDevice.on('write int', this.writeIntHandler);
  }

  componentWillUnmount() {
    this.consoleDevice.off('input buffer', this.inputBufferHandler);
    this.consoleDevice.off('waiting', this.waitingHandler);
    this.consoleDevice.off('write char', this.writeCharHandler);
    this.consoleDevice.off('write int', this.writeIntHandler);
  }

  write(text, type=0) {
    if (text.length === 0) return;

    if (this.lastNode === null || this.lastType !== type) {
      // If hasnt text node of the type, create one
      let textNode = document.createTextNode(text);
      if (type === 0) {
        this.outputRef.current.appendChild(textNode);
      } else if (type === 1) {
        let spanElem = document.createElement('span');
        spanElem.classList.add(styles.infoColor);
        spanElem.appendChild(textNode);
        this.outputRef.current.appendChild(spanElem);
      } else if (type === 2) {
        let spanElem = document.createElement('span');
        spanElem.classList.add(styles.errorColor);
        spanElem.appendChild(textNode);
        this.outputRef.current.appendChild(spanElem);
      }
      this.lastNode = textNode;
    } else {
      let textNode = this.lastNode;
      textNode.textContent += text;
    }
    this.outputRef.current.scrollTop = this.outputRef.current.scrollHeight;
    this.isNewLine = false;
    this.lastType = type;
  }

  writeLine(text, type=0) {
    this.write((this.isNewLine ? '' : '\n') + text + '\n', type);
    this.isNewLine = true;
  }

  addTextInput(text) {
		let inputBytes = new Array(text.length + 1);
		let buffer = Buffer.from(text);
		for (let i = 0; i < text.length; i++) {
			inputBytes[i] = buffer[i];
		}
		// Add \0 byte on end
		inputBytes[text.length] = 0;
		this.consoleDevice.addBytes(inputBytes);
  }

  inputKeyDown(e) {
    if (e.key.toLowerCase() === 'enter') {
      let text = e.target.value;
      if (text.length > 0) {
        e.target.value = '';
        this.addTextInput(text);
      }
    }
  }

  clearOutput() {
    this.outputRef.current.innerHTML = '';
    this.lastNode = null;
    this.lastType = null;
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.outAndInBufContainer}>
          <div className={styles.output}>
            <div ref={this.outputRef}></div>
          </div>
          <div className={styles.inputBuffer}>
            <div className={styles.title}>Input Buffer</div>
            <textarea readOnly spellCheck='false' value={this.state.inputBuffer.map(x => x.toString(16).padStart(2, '0')).join(' ')}></textarea>
          </div>
        </div>
        <div className={styles.bottom}>
          <input
            className={(this.state.waiting ? (styles.alertsOutline + ' ') : '') + styles.inputText}
            placeholder="input..."
            id='inputText'
            onKeyDown={this.inputKeyDown.bind(this)}
            ref={this.inputRef} />
          <button className={styles.btn} onClick={this.clearOutput.bind(this)}>Clear Output</button>
        </div>
      </div>
    );
  }
}
 
export default Console;