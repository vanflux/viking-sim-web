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

class Simulator extends Component {

	constructor(props) {
		super(props);

		this.programRef = createRef();
		this.assembledRef = createRef();
		this.symbolTableRef = createRef();
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
		// Open Memory Viewer
		Home.instance.spawnWindow("MemViewer", "Memory Viewer", 440, 420, <MemoryViewer memory={this.memory} />);
	}

	componentWillMount() {
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

		this.simulation.on('run error', this.simulationOnRunErrorHandler);
		this.simulation.on('run ended', this.simulationOnRunEndedHandler);
		this.simulation.on('breakpoint', this.simulationOnBreakpointHandler);
		this.simulation.on('console write char', this.simulationWriteCharHandler);
		this.simulation.on('console write int', this.simulationWriteIntHandler);
	}

	componentWillUnmount() {
		this.simulation.off('run error', this.simulationOnRunErrorHandler);
		this.simulation.off('run ended', this.simulationOnRunEndedHandler);
		this.simulation.off('breakpoint', this.simulationOnBreakpointHandler);
		this.simulation.off('console write char', this.simulationWriteCharHandler);
		this.simulation.off('console write int', this.simulationWriteIntHandler);
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

	onAssemble() {
		this.assemble();
	}
	
	onControlError(exc) {
		this.consoleRef.current.writeLine(exc);
	}

	render() {
		return (
			<div className={styles.container}>
				<Box display="flex" flexDirection="column" width="100%" height="100%">
					<Box display="flex" flexDirection="row" flex="1" overflow="auto">
						<Program curArchitecture={this.curArchitecture} ref={this.programRef} />
						<Assembled simulation={this.simulation} ref={this.assembledRef} />
						<SymbolTable ref={this.symbolTableRef} />
						<Box className={styles.rightArea} display="flex" flexDirection="column" justifyContent="space-between" flex="1" overflow="auto">
							<Registers simulation={this.simulation} registerBank={this.registerBank} />
							<Control simulation={this.simulation} onAssemble={this.onAssemble.bind(this)} onError={this.onControlError.bind(this)} />
						</Box>
					</Box>
					<Console simulation={this.simulation} onInput={this.onInput.bind(this)} ref={this.consoleRef} />
				</Box>
			</div>
		);
	}
}

export default Simulator;
