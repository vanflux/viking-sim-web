import styles from './Simulator.module.css'
import { Box } from "@material-ui/core";
import { Component, createRef } from 'react';
import Registers from '../registers/Registers.module';
import Memory from '../../business/asm/simulator/memory';
import architectureManager from '../../business/asm/architectureManager';
import RegisterBank from '../../business/asm/simulator/registerBank';
import Simulation from '../../business/asm/simulator/simulation';
import pseudoManager from '../../business/asm/pseudoInstructionConversions/pseudoManager';
import PseudoConverter from '../../business/asm/pseudoInstructionConversions/pseudoConverter';
import Assembler from '../../business/asm/assembler/assembler';
import Disassembler from '../../business/asm/disassembler/disassembler';
// eslint-disable-next-line
import asm from '../../business/index';
import Program from '../program/Program.module';
import SymbolTable from '../symbolTable/SymbolTable.module';
import Control from '../control/Control.module';
import Console from '../console/Console.module';
import Assembled from '../assembled/Assembled.module';
import MemoryViewer from '../memoryViewer/MemoryViewer.module';
import Home from '../home/Home.module';
import utils from '../../utils';

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

class Simulator extends Component {

	constructor(props) {
		super(props);

		this.programRef = createRef();
		this.assembledRef = createRef();
		this.symbolTableRef = createRef();
		this.registersRef = createRef();
		this.controlRef = createRef();
		this.consoleRef = createRef();

		this.curArchitecture = architectureManager.getViking16Arch();
		this.memory = Memory.createFromArchitecture(this.curArchitecture);
		this.registerBank = RegisterBank.createFromArchitecture(this.curArchitecture);
		this.simulation = new Simulation(this.curArchitecture, this.memory, this.registerBank);

		this.state = {
			stepDelay: 50,
		};
	}

	componentDidMount() {
		this.simulationOnRunErrorHandler = (error) => {
			this.consoleRef.current.writeLine('');
			this.consoleRef.current.writeLine('[Error | Simulation] ' + error.message);
		};
		
		this.simulationOnRunEndedHandler = () => {
			this.consoleRef.current.writeLine('');
			this.consoleRef.current.writeLine('[Info | Simulation] run ended.');
		};
		
		this.simulationOnBreakpointHandler = (pc) => {
			this.consoleRef.current.writeLine('');
			this.consoleRef.current.writeLine('[Info | Simulation] breakpoint at PC=' + pc.toString(16));
		};
		
		this.simulationWriteCharHandler = (char) => {
			if (char.charCodeAt(0) !== 0) {
				this.consoleRef.current.write(char);
			}
		};
		
		this.simulationWriteIntHandler = (int) => {
			this.consoleRef.current.write(String(int));
		};
		
    this.simulationPcUpdateHandler = utils.callLimiter((pc) => {
      this.assembledRef.current.setCurrentPC(pc);
			this.registersRef.current.setPC(pc);
    }, 20);

		this.simulationInBufHandler = (inputBuffer) => {
			this.consoleRef.current.setInputBuffer(inputBuffer);
		};
		
    this.simulationCyclesUpdateHandler = utils.callLimiter((cycles) => {
      this.controlRef.current.setCycles(cycles);
    }, 50);

		this.simulationWaitingInputHandler = (waitingInput) => {
			this.consoleRef.current.setInputAlert(waitingInput);
		};
		
    this.simulation.setBreakpointHandler((_, pc) => {
      return this.assembledRef.current.hasBreakpoint(pc);
    });

		this.simulation.on('run error', this.simulationOnRunErrorHandler);
		this.simulation.on('run ended', this.simulationOnRunEndedHandler);
		this.simulation.on('breakpoint', this.simulationOnBreakpointHandler);
		this.simulation.on('console write char', this.simulationWriteCharHandler);
		this.simulation.on('console write int', this.simulationWriteIntHandler);
    this.simulation.on('pc update', this.simulationPcUpdateHandler);
		this.simulation.on('input buffer', this.simulationInBufHandler);
    this.simulation.on('cycles update', this.simulationCyclesUpdateHandler);
		this.simulation.on('waiting input', this.simulationWaitingInputHandler);

		this.loadAsmCode();
		
		// Open Memory Viewer
		Home.instance.spawnWindow("MemViewer", "Memory Viewer", 440, 420, <MemoryViewer memory={this.memory} />);
	}

	componentWillUnmount() {
		this.simulation.off('run error', this.simulationOnRunErrorHandler);
		this.simulation.off('run ended', this.simulationOnRunEndedHandler);
		this.simulation.off('breakpoint', this.simulationOnBreakpointHandler);
		this.simulation.off('console write char', this.simulationWriteCharHandler);
		this.simulation.off('console write int', this.simulationWriteIntHandler);
    this.simulation.off('pc update', this.simulationPcUpdateHandler);
		this.simulation.off('input buffer', this.simulationInBufHandler);
    this.simulation.off('cycles update', this.simulationCyclesUpdateHandler);
		this.simulation.off('waiting input', this.simulationWaitingInputHandler);
	}

	async loadAsmCode() {
		console.log('Load asm code');
		let asmCode = localStorage.getItem('asmCode');
		if (asmCode) {
			this.loadSaved();
		} else {
			this.loadDefault();
		}
	}

	onInput(text) {
		let inputBytes = new Array(text.length + 1);
		let buffer = Buffer.from(text);
		for (let i = 0; i < text.length; i++) {
				inputBytes[i] = buffer[i];
		}
		// Add \0 byte on end
		inputBytes[text.length] = 0;
		this.simulation.addInput(inputBytes);
	}

	async assemble() {
		let programData = this.programRef.current.getText();
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

			this.assembledRef.current.setAssembled(result.disassembly.map(x => x.value).join('\n'));
			this.symbolTableRef.current.setSymbolTable(symbolTable);
			this.consoleRef.current.writeLine('[Info | Assembler] Successfully assembled');

			return result;
		} catch (exc) {
			console.error(exc);
			this.consoleRef.current.writeLine('[Error | Assembler] ' + exc.message);
		}
	}
	
	async run() {
		if (this.simulation.isRunning()) return;
		
		// If simulation is already ended -> reset
		if (this.simulation.hasEnded()) {
			await this.simulation.reset();
			await utils.sleep(100);
		}

		// If auto-assemble & program changed, assemble
		let curText = this.programRef.current.getText();
		if (this.controlRef.current.getAutoAssemble()) {
			if (this.lastText !== curText) {
				if (!await this.assemble()) {
					return;
				}
			}
		}
		this.lastText = curText;
		
		try {
			await this.simulation.run();
		} catch (exc) {
			this.consoleRef.current.writeLine(exc);
		}
	}

	async pause() {
		try {
			await this.simulation.stop();
		} catch (exc) {
			this.consoleRef.current.writeLine(exc);
		}
	}
	
	async step() {
		try {
			await this.simulation.step();
		} catch (exc) {
			this.consoleRef.current.writeLine(exc);
		}
	}
	
	async reset() {
		try {
			await this.simulation.reset();
		} catch (exc) {
			this.consoleRef.current.writeLine(exc);
		}
	}

	onStepIntervalChanged(stepInterval) {
		this.simulation.setStepInterval(stepInterval);
	}

	save(code) {
		try {
			localStorage.setItem('asmCode', code);
			return true;
		} catch (exc) {
			console.error(exc);
			return false;
		}
	}

	async loadSaved() {
		let asmCode = localStorage.getItem('asmCode');
		this.programRef.current.setText(asmCode);
	}

	async loadDefault() {
		this.programRef.current.setText(defaultProgramData);
	}

	render() {
		return (
			<div className={styles.container}>
				<Box display="flex" flexDirection="column" width="100%" height="100%">
					<Box display="flex" flexDirection="row" flex="1" overflow="auto">
						<Program
							curArchitecture={this.curArchitecture}
							onSaveRequest={this.save.bind(this)}
							onLoadSavedRequest={this.loadSaved.bind(this)}
							onLoadDefaultRequest={this.loadDefault.bind(this)}
							ref={this.programRef} />
						<Assembled ref={this.assembledRef} />
						<SymbolTable architecture={this.curArchitecture} ref={this.symbolTableRef} />
						<Box className={styles.rightArea} display="flex" flexDirection="column" justifyContent="space-between" flex="1" overflow="auto">
							<Registers registerBank={this.registerBank} ref={this.registersRef} />
							<Control
								onAssemble={this.assemble.bind(this)}
								onRun={this.run.bind(this)}
								onPause={this.pause.bind(this)}
								onStep={this.step.bind(this)}
								onReset={this.reset.bind(this)}
								onStepIntervalChanged={this.onStepIntervalChanged.bind(this)}
								ref={this.controlRef} />
						</Box>
					</Box>
					<Console onInput={this.onInput.bind(this)} ref={this.consoleRef} />
				</Box>
			</div>
		);
	}
}

export default Simulator;
