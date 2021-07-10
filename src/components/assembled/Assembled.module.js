import { Component } from "react";
import Editor from "@monaco-editor/react";
import styles from './Assembled.module.css';
import utils from "../../utils";

const GUTTER_GLYPH_MARGIN = 2;

class Assembled extends Component {
  constructor(props) {
    super(props);

    if (props.simulation == null) throw new Error('props.simulation null');
    
    this.simulation = props.simulation;
    this.onBreakpoint = typeof props.onBreakpoint === 'function' ? props.onBreakpoint : ()=>{};
    
    this.breakpointDecorations = {};
    this.curLineRunningDecorationId = null;
    this.curLineRunningDecoration = null;
    this.monaco = null;
    this.editor = null;

    this.state = {  };
  }

  componentWillMount() {
    this.pcUpdateHandler = utils.callLimiter((pc) => {
      this.setLineRunning(pc/2+1);
    }, 20);
    this.simulation.on('pc update', this.pcUpdateHandler);
  }

  componentWillUnmount() {
    this.simulation.off('pc update', this.pcUpdateHandler);
  }

  async setBreakpoints(breakpointList) {
    this.removeAllBreakpoints();
    for (let pc of breakpointList) {
      this.setBreakpoint(pc);
    }
  }
  
  setBreakpoint(pc) {
    let lineNumber = pc / 2 + 1;
    
    let lineCount = this.editor.getModel().getLineCount();
    if (lineNumber <= 0 || lineNumber > lineCount) return;

    let bpDec = this.breakpointDecorations[pc];
    if (bpDec) return;
    
    bpDec = this.editor.deltaDecorations([], [
      {
        range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: styles.breakpoint,
        },
      },
    ]);
    this.breakpointDecorations[pc] = bpDec;
    this.onBreakpoint(pc, true);
  }

  removeBreakpoint(pc) {
    let bpDec = this.breakpointDecorations[pc];
    if (!bpDec) return;
    delete this.breakpointDecorations[pc];
    this.editor.deltaDecorations(bpDec, []);
    this.onBreakpoint(pc, false);
  }

  removeAllBreakpoints() {
    for (let pc in this.breakpointDecorations) {
      let bpDec = this.breakpointDecorations[pc];
      delete this.breakpointDecorations[pc];
      this.editor.deltaDecorations(bpDec, []);
      this.onBreakpoint(pc, false);
    }
  }

  toggleBreakpoint(pc) {
    let bpDec = this.breakpointDecorations[pc];
    if (bpDec) {
      this.removeBreakpoint(pc);
    } else {
      this.setBreakpoint(pc);
    }
  }

  setAssembled(text) {
    this.editor.setValue(text);
  }

  setLineRunning(lineNumber) {
    let lineCount = this.editor.getModel().getLineCount();
    if (lineNumber <= 0 || lineNumber > lineCount) {
      this.curLineRunningDecoration = [];
    } else {
      this.curLineRunningDecoration = [
        {
          range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: styles.currentLineRunning,
          }
        }
      ];
      this.editor.revealLine(lineNumber);
    }

    let oldDec = this.curLineRunningDecorationId ? this.curLineRunningDecorationId : [];
    this.curLineRunningDecorationId = this.editor.deltaDecorations(oldDec, this.curLineRunningDecoration);
  }

	onEditorMount(editor, monaco) {
		this.editor = editor;
    this.monaco = monaco;

		let self = this;
		this.editor.updateOptions({
			wordBasedSuggestions: false,
			automaticLayout: true,
			lineDecorationsWidth: 0,
			glyphMargin: true,
			minimap: {
				enabled: false,
			},
			lineNumbers: (n) => ((n-1)*2).toString(16).padStart(4, '0'),
			readOnly: true,
		});
		
		this.editor.onMouseDown(async (e) => {
			let { target: { type, position: { lineNumber } } } = e;
			if (type !== GUTTER_GLYPH_MARGIN) return;
			let pc = (lineNumber - 1) * 2;
			await self.toggleBreakpoint(pc);
		});
	}

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Disassembly</div>
        <Editor
          className={styles.editor}
          language='vikingAsm'
          theme='vikinAsmTheme'
          onMount={this.onEditorMount.bind(this)}
        />
      </div>
    );
  }
}
 
export default Assembled;