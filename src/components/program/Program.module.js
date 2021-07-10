import { Box } from '@material-ui/core';
import Editor from '@monaco-editor/react';
import { Component } from 'react';
import operationsManager from '../../business/asm/operations/operationsManager';
import styles from './Program.module.css'

const defaultProgramData =
`main
    ldw	sr,writec
    ldi	r4,str
    ldi	r3,loop
loop
    ldb	r2,r4
    stw	r2,sr
    add	r4,1
    bnz	r2,r3
    hcf

writec	0xf000
str	"hello world!"`;

let alreadyCreatedLang = false;

class Program extends Component {
  constructor(props) {
    super(props);

    if (props.curArchitecture == null) throw new Error('props.curArchitecture null');

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
    // Nothing
  }

  getText() {
    return this.editor.getValue();
  }

  setText(text) {
    this.editor.setValue(text);
  }

  render() {
    return (
      <Box
        className={styles.program} 
        display="flex" 
        flexDirection="column" 
        flex="1" 
        overflow="hidden"
      >
        <div className='areaTitle'>Program</div>
        <Editor
          className={styles.program}
          display="flex"
          flex="1"
          overflow="hidden"
          
          language='vikingAsm'
          theme='vikinAsmTheme'
          value={defaultProgramData}

          beforeMount={this.onEditorWillMount.bind(this)}
          onMount={this.onEditorMount.bind(this)}
        />
      </Box>
    );
  }
}
 
export default Program;