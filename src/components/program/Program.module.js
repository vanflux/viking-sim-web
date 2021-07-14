import Editor from '@monaco-editor/react';
import { Component, createRef } from 'react';
import operationsManager from '../../business/asm/operations/operationsManager';
import styles from './Program.module.css'

let alreadyCreatedLang = false;

class Program extends Component {
  constructor(props) {
    super(props);

    if (props.curArchitecture == null) throw new Error('props.curArchitecture null');

    this.infosRef = createRef();

    this.onChange = typeof props.onChange === 'function' ? props.onChange : ()=>{};
    this.onLoadSavedRequest = typeof props.onLoadSavedRequest === 'function' ? props.onLoadSavedRequest : ()=>{};
    this.onLoadDefaultRequest = typeof props.onLoadDefaultRequest === 'function' ? props.onLoadDefaultRequest : ()=>{};
    this.onSaveRequest = typeof props.onSaveRequest === 'function' ? props.onSaveRequest : ()=>{};

    this.opsNames = operationsManager.getOperationNames();
    this.regNames = props.curArchitecture.getRegisterNames();

    this.state = {  }
  }

  onEditorWillMount(monaco) {
    this.monaco = monaco;

    if (alreadyCreatedLang) return;
    alreadyCreatedLang = true;

    monaco.languages.register({ id: 'vikingAsm' });
        
    monaco.languages.setMonarchTokensProvider('vikingAsm', {

      operationKeywords: this.opsNames,
      registerKeywords: this.regNames,

      decimalNumbers: /\d+/,
      hexNumbers: /(?:0x|0B)[\da-fA-F]+/,
      
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          [ /\b@hexNumbers|@decimalNumbers\b/i, 'number' ],
          [
            /\b\w+\b/,
            {
              cases: {
                '@operationKeywords': 'operationKeywords',
                '@registerKeywords': 'registersKeyWords',
                '@default': 'symbols',
              },
            },
          ],

          [/^[ \t]*(?:(?:\/\/)|;).*$/,    'comment'],

          // strings
          [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' } ],
        ],
        string: [
          [/[^\\"]+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
        ],
      },
    });

    monaco.languages.registerCompletionItemProvider('vikingAsm', {
      provideCompletionItems: () => {
        let suggestions = this.opsNames.map(opName => ({
          label: opName,
          detail: '...',
          documentation: '...',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: opName,
        }));
        return { suggestions: suggestions };
      }
    });
    
    monaco.editor.defineTheme('vikinAsmTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'operationKeywords', foreground: 'e55283' },
        { token: 'registersKeyWords', foreground: 'ffc100' },
        { token: 'symbols', foreground: '92db57' },
        { token: 'number', foreground: '7d81ea' }
      ],
    });
  }

  onEditorMount(editor, monaco) {
    this.editor = editor;
    
    this.editor.getModel().onDidChangeContent(this.onChange);
    this.onChange();
    
    if (this.initText) {
      this.editor.setValue(this.initText);
    }

    this.saveBindHandler = this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.save.bind(this));
  }

  getText() {
    if (this.editor == null) return '';
    return this.editor.getValue();
  }

  setText(text) {
    this.initText = text;
    if (this.editor == null) return;
    let fullRange = this.editor.getModel().getFullModelRange();
    this.editor.executeEdits(null, [{ text: '', range: fullRange }]);
    this.editor.executeEdits(null, [{ text, range: fullRange }]);
  }

  setInfos(infos) {
    this.infosRef.current.textContent = infos;
    setTimeout(() => this.infosRef.current.textContent = '', 3000);
  }

  highlightLine(lineNumber) {
    let lineCount = this.editor.getModel().getLineCount();
    if (lineNumber <= 0 || lineNumber > lineCount) return;
    let lineDec = [
      {
        range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: styles.curLineHighlight,
        }
      }
    ];
    this.editor.revealLine(lineNumber);
    let decId = this.editor.deltaDecorations([], lineDec);
    setTimeout(() => this.editor.deltaDecorations(decId, []), 500);
  }

  save() {
    let code = this.editor.getValue();
    if (this.onSaveRequest(code) === true) {
      this.setInfos('Saved');
    } else {
      console.error('Save error');
    }
  }

  loadSaved() {
    this.onLoadSavedRequest();
  }

  loadDefault() {
    this.onLoadDefaultRequest();
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <div>Program</div>
          <div className={styles.infos} ref={this.infosRef}></div>
          <div>
            <button className={styles.btn} onClick={this.save.bind(this)}>Save</button>
            <button className={styles.btn} onClick={this.loadSaved.bind(this)}>Load</button>
            <button className={styles.btn} onClick={this.loadDefault.bind(this)}>Load Example</button>
          </div>
        </div>
        <Editor
          className={styles.editor}          
          language='vikingAsm'
          theme='vikinAsmTheme'
          beforeMount={this.onEditorWillMount.bind(this)}
          onMount={this.onEditorMount.bind(this)}
        />
      </div>
    );
  }
}
 
export default Program;