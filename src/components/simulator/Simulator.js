import './Simulator.css'
import { Box } from "@material-ui/core";
import { Component } from 'react';
import Editor from "@monaco-editor/react";
import { DataGrid, GridDensityTypes } from '@material-ui/data-grid';
import Registers from '../registers/Registers.module';
import Memory from '../../business/asm/simulator/memory';
import architectureManager from '../../business/asm/architectureManager';
import RegisterBank from '../../business/asm/simulator/registerBank';
import Simulation from '../../business/asm/simulator/simulation';
import pseudoManager from '../../business/asm/pseudoInstructionConversions/pseudoManager';
import PseudoConverter from '../../business/asm/pseudoInstructionConversions/pseudoConverter';
import Assembler from '../../business/asm/assembler/assembler';
import Disassembler from '../../business/asm/disassembler/disassembler';
import asm from '../../business/index';
import Program from '../program/Program.module';
import SymbolTable from '../symbolTable/SymbolTable.module';

const GUTTER_GLYPH_MARGIN = 2;

class Simulator extends Component {

	constructor(props) {
		super(props);

		this.inputAsmEditor = null;
		this.assembledAsmEditor = null;

		this.curArchitecture = architectureManager.getViking16Arch();
		this.memory = Memory.createFromArchitecture(this.curArchitecture);
		this.registerBank = RegisterBank.createFromArchitecture(this.curArchitecture);
		this.simulation = new Simulation(this.curArchitecture, this.memory, this.registerBank);
		this.breakpoints = new Set();

		this.state = {
			stepDelay: 50,
		};
	}

	async assemble(e) {
		let programData = this.inputAsmEditor.getValue();
		try {
			let pseudoInstructions = pseudoManager.getPseudoInstructions();
			let pseudoConverter = new PseudoConverter(pseudoInstructions);

			let assembler = new Assembler(this.curArchitecture, programData, pseudoConverter);
			let assemblerResult = assembler.assemble();

			let disassembler = new Disassembler(this.curArchitecture);
			let disassemblerResult = disassembler.disassemble(assemblerResult.rawObjectCode);

			let { symbolTable } = assemblerResult;
			let disassembly = disassemblerResult.map(x => ({value: x.value, pc: x.pc, code: x.code}) );

			let result = { symbolTable, disassembly };

			this.simulation.setRawObjCode(assemblerResult.rawObjectCode);
			await this.simulation.reset();

			console.log(result.disassembly);

			//mainWindow.writeLineOutput('[Info | Assembler] Successfully assembled');

			return result;
		} catch (exc) {
				console.error(exc);
				//mainWindow.writeLineOutput('[Error | Assembler] ' + exc.message);
		}
	}

	onInputEditorMount(editor, monaco) {
		this.inputAsmEditor = editor;
		editor.updateOptions({
			wordBasedSuggestions: false,
			automaticLayout: true,
			tabSize: 8,
			detectIndentation: false,
			acceptSuggestionOnCommitCharacter: false,
			suggestOnTriggerCharacters: false,
			showFoldingControls: 'always',
		});
	}

	onAssembledEditorMount(editor, monaco) {
		this.assembledAsmEditor = editor;
		let self = this;
		editor.updateOptions({
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
		
		editor.onMouseDown(async (e) => {
			let { target: { type, position: { lineNumber } } } = e;
			if (type !== GUTTER_GLYPH_MARGIN) return;
			let pc = (lineNumber - 1) * 2;
			await self.toggleBreakpoint(pc);
		});
	}

	async toggleBreakpoint(pc) {
		console.log('toggleBreakpoint at', pc);
	}

	render() {
		return (
			<div className="simulator">
				<Box display="flex" flexDirection="column" width="100%" height="100%">
					<Box display="flex" flexDirection="row" flex="1" overflow="auto">
						<Program />

						<Box className="assembledAsmArea" display="flex" flexDirection="column" overflow="hidden">
							<div className='areaTitle'>Disassembly</div>
							<Editor
								id="assembledAsmArea"
								display="flex"
								flex="1"
								overflow="hidden"

								language='vikingAsm'
								theme='vikinAsmTheme'

								onMount={this.onAssembledEditorMount.bind(this)}
							/>
						</Box>

						<SymbolTable />

						<Box className='rightArea' display="flex" flexDirection="column" justifyContent="space-between" flex="1" overflow="auto">
							<Registers registerBank={this.registerBank} />
							
							<Box className='controlArea' display="flex" flexDirection="column" flex="1" alignItems="center">
								<div className='d-flex controlLabel'>Control</div>
		
								<Box className='cycleArea' display="flex" flexDirection="row">
									<div className='cycleLabel'>Cycle:</div>
									<div id='cycle'>0</div>
								</Box>
								
								<button className='controlBtn' id='assembleBtn' onClick={this.assemble.bind(this)}>Assemble</button>
								<button className='controlBtn' id='resetBtn'>Reset</button>
								<button className='controlBtn' id='stopBtn'>Stop</button>
								<button className='controlBtn' id='runBtn'>Run</button>
								<button className='controlBtn' id='stepBtn'>Step</button>
								<div className='delayLabel'>Delay (ms):</div>
								<input
									className='w-100'
									id='delayInput'
									type='number'
									value={this.state.stepDelay}
									onChange={(e) => this.setState({stepDelay: parseInt(e.target.value)}) }
									min="1"
									max="1000"
								></input>
							</Box>
						</Box>
					</Box>
					<Box className='bottomArea' display="flex" flexDirection="column">
						<Box display="flex" flexDirection="row" flex="1">
							<Box className='outputArea' display="flex" flex="1">
								<textarea readOnly spellCheck='false' id="outputTextArea"></textarea>
							</Box>
							<Box className='inputBufferArea' display="flex" flexDirection="column">
								<div className='areaTitle'>Input Buffer</div>
								<textarea readOnly spellCheck='false' id="inputBufferTextArea"></textarea>
							</Box>
						</Box>
						<input placeholder="input..." id='inputText'/>
					</Box>
				</Box>
			</div>
		);
	}
}

export default Simulator;
