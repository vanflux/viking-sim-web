import { Component } from "react";
import Editor from "@monaco-editor/react";
import styles from './Assembled.module.css';

const GUTTER_GLYPH_MARGIN = 2;

class Assembled extends Component {
  constructor(props) {
    super(props);
    
    this.breakpointDecorations = {};
    this.pcBreakpoints = new Set();
    this.curLineRunningDecorationId = null;
    this.curLineRunningDecoration = null;
    this.monaco = null;
    this.editor = null;

    this.state = {  };
  }

  hasBreakpoint(pc) {
    return this.pcBreakpoints.has(pc);
  }

  toggleBreakpoint(pc) {
    if (this.pcBreakpoints.has(pc)) {
      this.removeBreakpoint(pc);
    } else {
      this.setBreakpoint(pc);
    }
  }
  
  setBreakpoint(pc) {
    if (this.editor == null) return;
    if (this.pcBreakpoints.has(pc)) return;

    let lineNumber = pc / 2 + 1;    
    let lineCount = this.editor.getModel().getLineCount();
    if (lineNumber <= 0 || lineNumber > lineCount) return;

    this.pcBreakpoints.add(pc);
    let bpDec = this.editor.deltaDecorations([], [
      {
        range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: styles.breakpoint,
        },
      },
    ]);
    this.breakpointDecorations[pc] = bpDec;
  }

  removeBreakpoint(pc) {
    if (this.editor == null) return;
    if (!this.pcBreakpoints.has(pc)) return;

    this.pcBreakpoints.delete(pc);
    let bpDec = this.breakpointDecorations[pc];
    delete this.breakpointDecorations[pc];
    this.editor.deltaDecorations(bpDec, []);
  }

  removeAllBreakpoints() {
    for (let pc of this.pcBreakpoints) this.removeBreakpoint(pc);
  }

  setBreakpoints(pcs) {
    this.removeAllBreakpoints();
    for (let pc of pcs) this.setBreakpoint(pc);
  }

  setAssembled(text) {
    if (this.editor == null) return;
    if (typeof text !== 'string') throw new Error('Text isnt string');
    
    let linesCount = text.split('\n').length;
    let newBreakpointPCs = Array.from(this.pcBreakpoints).filter(pc => pc / 2 < linesCount);
    this.editor.setValue(text);
    this.setBreakpoints(newBreakpointPCs);
    this.setCurrentPC(0);
  }

  setCurrentPC(pc) {
    if (this.editor == null) return;
    
    let lineNumber = pc / 2 + 1;
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
		
		this.editor.onMouseDown((e) => {
			let { target: { type, position: { lineNumber } } } = e;
			if (type !== GUTTER_GLYPH_MARGIN) return;
			let pc = (lineNumber - 1) * 2;
			self.toggleBreakpoint(pc);
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