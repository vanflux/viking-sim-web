import styles from './Simulator.module.css'
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
import utils from '../../utils';
import ConsoleDevice from '../../business/asm/simulator/io/devices/consoleDevice';
import CanvasDevice from '../../business/asm/simulator/io/devices/canvasDevice';
import CanvasViewer from '../canvasViewer/CanvasViewer.module';
import Home from '../home/Home.module';

const defaultProgramData =
`main
	ldi	r4, str
loop
	ldb	r2, r4
	stw	r2, 0xf000 // Write char IO
	add	r4, 1
	bnz	r2, loop
	hcf

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
		
		this.consoleDevice = new ConsoleDevice();
		this.canvasDevice = new CanvasDevice();
		this.simulation.registerPorts(this.consoleDevice.getPorts());
		this.simulation.registerPorts(this.canvasDevice.getPorts());

		this.state = { };
	}

	componentDidMount() {
		this.simulationOnRunErrorHandler = (error) => {
			this.consoleRef.current.writeLine('[Error | Simulation] ' + error.message, 2);
		};
		
		this.simulationOnRunEndedHandler = () => {
			this.consoleRef.current.writeLine('[Info | Simulation] run ended.', 1);
		};
		
		this.simulationOnBreakpointHandler = (pc) => {
			this.consoleRef.current.writeLine('[Info | Simulation] breakpoint at PC=' + pc.toString(16), 1);
		};
		
    this.simulationPcUpdateHandler = utils.callLimiter((pc) => {
      this.assembledRef.current.setCurrentPC(pc);
			this.registersRef.current.setPC(pc);
    }, 20);
		
    this.simulationCyclesUpdateHandler = utils.callLimiter((cycles) => {
      this.controlRef.current.setCycles(cycles);
    }, 50);
		
    this.simulationResetHandler = () => {
      this.consoleDevice.reset();
			this.canvasDevice.reset();
    };
		
    this.simulation.setBreakpointHandler((_, pc) => {
      return this.assembledRef.current.hasBreakpoint(pc);
    });

		this.simulation.on('run error', this.simulationOnRunErrorHandler);
		this.simulation.on('run ended', this.simulationOnRunEndedHandler);
		this.simulation.on('breakpoint', this.simulationOnBreakpointHandler);
    this.simulation.on('pc update', this.simulationPcUpdateHandler);
    this.simulation.on('cycles update', this.simulationCyclesUpdateHandler);
    this.simulation.on('reset', this.simulationResetHandler);

		this.loadAsmCode();

		Home.instance.spawnWindow('MemView', 'Memory Viewer', 410, 450, <MemoryViewer memory={this.memory} />);
	}

	componentWillUnmount() {
		this.simulation.off('run error', this.simulationOnRunErrorHandler);
		this.simulation.off('run ended', this.simulationOnRunEndedHandler);
		this.simulation.off('breakpoint', this.simulationOnBreakpointHandler);
    this.simulation.off('pc update', this.simulationPcUpdateHandler);
    this.simulation.off('cycles update', this.simulationCyclesUpdateHandler);
    this.simulation.off('reset', this.simulationResetHandler);
	}

	loadAsmCode() {
		console.log('Load asm code');
		let asmCode = localStorage.getItem('asmCode');
		if (asmCode) {
			this.loadSaved();
		} else {
			this.loadDefault();
		}
	}

	assemble() {
		let programData = this.programRef.current.getText();
		try {
			let ioPortSymbolTable = this.simulation.getPortsSymbolTable();

			let pseudoInstructions = pseudoManager.getPseudoInstructions();
			let pseudoConverter = new PseudoConverter(pseudoInstructions);

			let assembler = new Assembler(this.curArchitecture, programData, pseudoConverter);
			assembler.addExtraSymbolTable(ioPortSymbolTable);
			let assemblerResult = assembler.assemble();
			this.curAssembleResult = assemblerResult;

			let disassembler = new Disassembler(this.curArchitecture);
			let disassemblerResult = disassembler.disassemble(assemblerResult.rawObjectCode);

			let { symbolTable } = assemblerResult;
			let disassembly = disassemblerResult.map(x => ({value: x.value, pc: x.pc, code: x.code}) );

			let result = { symbolTable, disassembly };

			this.simulation.setRawObjCode(assemblerResult.rawObjectCode);
			this.simulation.reset();

			this.assembledRef.current.setAssembled(result.disassembly.map(x => x.value).join('\n'));
			this.symbolTableRef.current.setSymbolTable(symbolTable);
			this.consoleRef.current.writeLine('[Info | Assembler] Successfully assembled', 1);

			return result;
		} catch (exc) {
			console.error(exc);
			this.consoleRef.current.writeLine('[Error | Assembler] ' + exc.message, 2);
		}
	}
	
	async run() {
		if (this.simulation.isRunning()) return;
		
		// If simulation is already ended -> reset
		if (this.simulation.hasEnded()) {
			this.simulation.reset();
			await utils.sleep(100);
		}

		// If auto-assemble & program changed, assemble
		let curText = this.programRef.current.getText();
		if (this.controlRef.current.getAutoAssemble()) {
			if (this.lastText !== curText) {
				if (!this.assemble()) {
					return;
				}
			}
			this.lastText = curText;
		}
		
		try {
			this.simulation.run();
		} catch (exc) {
			this.consoleRef.current.writeLine('[Error | Simulation] ' + exc.message, 2);
		}
	}

	pause() {
		try {
			this.simulation.stop();
		} catch (exc) {
			this.consoleRef.current.writeLine('[Error | Simulation] ' + exc.message, 2);
		}
	}
	
	step() {
		try {
			this.simulation.step();
		} catch (exc) {
			this.consoleRef.current.writeLine('[Error | Simulation] ' + exc.message, 2);
		}
	}
	
	reset() {
		try {
			this.simulation.reset();
		} catch (exc) {
			this.consoleRef.current.writeLine('[Error | Simulation] ' + exc.message, 2);
		}
	}

	onStepIntervalChanged(stepInterval) {
		this.simulation.setStepInterval(stepInterval);
	}

	onSymbolNameClick(symbol) {
		if (this.curAssembleResult == null) return;
		let additionInfo = this.curAssembleResult.additionalInfos.find(x => x && x.parsed && x.parsed.symbol === symbol.symbolName);
		if (additionInfo == null) return;
		let { lineNumber } = additionInfo;
		this.programRef.current.highlightLine(lineNumber);
	}
	
	onSymbolValueClick(symbol) {
		this.assembledRef.current.setCurrentPC(symbol.symbolValue);
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

	loadSaved() {
		let asmCode = localStorage.getItem('asmCode');
		this.programRef.current.setText(asmCode);
	}

	loadDefault() {
		this.programRef.current.setText(defaultProgramData);
	}

	render() {
		const components = {
			sym: (
				<SymbolTable
					architecture={this.curArchitecture}
					onSymbolNameClick={this.onSymbolNameClick.bind(this)}
					onSymbolValueClick={this.onSymbolValueClick.bind(this)}
					ref={this.symbolTableRef} />
			),
			prog: (
				<Program
					curArchitecture={this.curArchitecture}
					portsSymbols={this.simulation.getPortsSymbolsList()}
					onSaveRequest={this.save.bind(this)}
					onLoadSavedRequest={this.loadSaved.bind(this)}
					onLoadDefaultRequest={this.loadDefault.bind(this)}
					ref={this.programRef} />
			),
			asm: (
				<Assembled ref={this.assembledRef} />
			),
			reg: (
				<Registers registerBank={this.registerBank} ref={this.registersRef} />
			),
			ctr: (
				<Control
					onAssemble={this.assemble.bind(this)}
					onRun={this.run.bind(this)}
					onPause={this.pause.bind(this)}
					onStep={this.step.bind(this)}
					onReset={this.reset.bind(this)}
					onStepIntervalChanged={this.onStepIntervalChanged.bind(this)}
					ref={this.controlRef} />
			),
			con: (
				<Console consoleDevice={this.consoleDevice} ref={this.consoleRef} />
			),
			can: (
				<CanvasViewer canvasDevice={this.canvasDevice} />
			),
		};

		return (
			<div className={styles.container}>
				<div className={styles.top}>
					<div className={styles.programContainer}>{components.prog}</div>
					<div className={styles.assembledContainer}>{components.asm}</div>
					<div className={styles.symbolTableContainer}>{components.sym}</div>
					<div className={styles.registersControlArea}>{components.reg}{components.ctr}</div>
				</div>
				<div className={styles.bottom}>
					<div className={styles.consoleContainer}>{components.con}</div>
					<div className={styles.canvasContainer}>{components.can}</div>
				</div>
			</div>
		);
	}
}

export default Simulator;
