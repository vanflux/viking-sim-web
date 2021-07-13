import { EventEmitter } from 'events';
import utils from '../../../utils';
import Instruction from '../instruction';

const endSimulationCode = 0x0003;
const defaultBreakpointHandler = (simulation, pc) => false;

export default class Simulation extends EventEmitter {
    constructor(architecture, memory, registerBank) {
        super();

        this.architecture = architecture;
        this.memory = memory;
        this.registerBank = registerBank;
        this.codeExecutionMaxPC = 0;
        this.runId = null;
        this.running = false;
        this.ended = false;
        this.stopping = false;
        this.waitingInput = false;
        this.stepInterval = 50;
        this.cycles = 0;
        this.pc = 0;
        this.inputBytes = [];

        this.breakpointHandler = defaultBreakpointHandler;
        this.setupMemoryHandlers();
    }

    async reset() {
        if (this.running && !this.stopping) await this.stop();
        this.ended = false;
        this.carry = 0;
        this.setPC(0);
        this.setCycles(0);
        this.resetInput();
        this.registerBank.reset();
        this.registerBank.setValue('sp', 0xdffe);
        this.memory.reset();
        await this.writeObjCodeMemory();
        this.emit('reset');
    }

    setupMemoryHandlers() {
        this.memory.onReadWord = async (address) => {
            if (address < 0xe000) return; // ok

            switch (address) {
                case 0xf004:
                    this.setWaitingInput(true);
                    while(!this.stopping && this.inputBytes.length < 1) await utils.sleep(50);
                    this.setWaitingInput(false);
                    if (this.stopping) throw new Error('User stopped simulation without give input');
                    return this.readInputChar();
                case 0xf006:
                    this.setWaitingInput(true);
                    while(!this.stopping && this.inputBytes.length < 2) await utils.sleep(50);
                    this.setWaitingInput(false);
                    if (this.stopping) throw new Error('User stopped simulation without give input');
                    return this.readInputInt();
                default:
                    // read on unauthorized location
                    this.emit('run error', new Error('read on unauthorized location [' + address.toString(16) + ']'));
                    await this.stop();
            }
        };
        
        this.memory.onWriteWord = async (address, value) => {
            if (address < 0xe000) return true; // ok

            switch (address) {
                case 0xf000:
                    this.emit('console write char', String.fromCharCode(value));
                    return true;
                case 0xf002:
                    this.emit('console write int', utils.unsignedToSigned(value));
                    return true;
                default:
                    // write on unauthorized location
                    this.emit('run error', new Error('write on unauthorized location [' + address.toString(16) + '] = ' + value.toString(16)));
                    await this.stop();
                    return false;
            }
        };
    }

    readInputChar() {
        if (this.inputBytes.length === 0) throw new Error('Empty input');
        let byte = this.getNextInputByte();
        return byte;
    }
    
    readInputInt() {
        if (this.inputBytes.length === 0) throw new Error('Empty input');
        let zeroCharCode = '0'.charCodeAt(0);
        let nineCharCode = '9'.charCodeAt(0);
        let minusCharCode = '-'.charCodeAt(0);

        function isMinusChar(c) {
            return minusCharCode === c;
        }

        function isNumberChar(c) {
            return c >= zeroCharCode && c <= nineCharCode;
        }

        function charToNumber(c) {
            return c - zeroCharCode;
        }

        let int = 0;
        let firstC = this.getNextInputByte();
        if (isNumberChar(firstC) || isMinusChar(firstC)) {
            if (isNumberChar(firstC)) {
                int = charToNumber(firstC);
            }

            let length = this.inputBytes.length;
            for (let i = 0; i < length; i++) {
                let c = this.getNextInputByte();
                if (isNumberChar(c)) {
                    let number = charToNumber(c);
                    int *= 10;
                    int += number;
                } else {
                    if (c === 0) {
                        this.getNextInputByte();
                    }
                    break;
                }
            }

            if (isMinusChar(firstC)) {
                int *= -1;
            }
        } else {
            // lê os bytes do inputs até acabar ou até o byteWidth da arquitetura
            // se o inputBytes tiver 1 byte e o byteWidth da arquitetura for 2 bytes, 16 bits, vai ler apenas 1 byte
            // se o inputBytes tiver 5 bytes e o byteWidth da arquitetura for 2 bytes, vai ler apenas 2 bytes
            int = firstC;
            let length = Math.min(this.architecture.getByteWidth() - 1, this.inputBytes.length);
            for (let i = 0; i < length; i++) {
                let c = this.getNextInputByte();
                this.emit('input buffer', this.inputBytes);
                int = (int << 8) | c;
            }
        }
        
        return int;
    }

    setRawObjCode(rawObjCode) {
        if (rawObjCode.length > 0xf000 * 2) throw new Error('Object code too big for the memory');
        this.rawObjCode = rawObjCode;
    }

    async writeObjCodeMemory() {
        if (!this.rawObjCode) return;
        let wordArray = this.rawObjCode
            .match(/.{1,4}/g)
            .map(x => parseInt(x, 16));
        for (let i = 0; i < wordArray.length; i++) {
            let word = wordArray[i];
            await this.memory.writeWord(i*2, word);
        }

        this.codeExecutionMaxPC = wordArray.length * 2;
    }

    async step() {
        if (this.pc >= this.codeExecutionMaxPC) throw new Error('PC run out of program bounds');

        let code = await this.memory.readWord(this.pc);
        if (code === endSimulationCode) {
            this.ended = true;
            this.emit('run ended');
            return await this.stop();
        }

        let instruction = Instruction.disassemble(code, this.architecture);
        await instruction.execute(this);

        this.incrementPC(2);
        this.incrementCycles(1);
        
        if (this.breakpointHandler(this, this.pc)) {
            this.emit('breakpoint', this.pc);
            await this.stop();
        }
    }

    async runner() {
        this.emit('run started');
        try {
            while(!this.stopping) {
                await this.step();
                if (this.stepInterval > 0) await utils.sleep(this.stepInterval);
            }
        } catch (error) {
            console.error(error);
            this.emit('run error', error);
        }
        this.running = false;
        this.stopping = false;
    }

    async stop() {
        if (!this.running) throw new Error('Simulation already stopped');
        if (this.stopping) throw new Error('Simulation already stopping');
        this.stopping = true;
        while(this.waitingInput) await utils.sleep(50);
        clearTimeout(this.runId);
        this.runId = null;
    }

    async run() {
        if (this.running) throw new Error('Simulation already running');
        if (this.stopping) throw new Error('Simulation stopping');
        this.running = true;
        this.stopping = false;
        this.runId = setTimeout(this.runner.bind(this));
    }

    isWaitingInput() {
        return this.waitingInput;
    }

    isRunning() {
        return this.running;
    }

    isStopping() {
        return this.stopping;
    }

    hasEnded() {
        return this.ended;
    }

    getNextInputByte() {
        let byte = this.inputBytes.shift();
        this.emit('input buffer', this.inputBytes);
        return byte;
    }

    resetInput() {
        this.inputBytes.length = 0;
        this.emit('input buffer', this.inputBytes);
    }

    addInput(inputBytes) {
        for (let byte of inputBytes) 
            this.inputBytes.push(byte & 0xFF);
        this.emit('input buffer', this.inputBytes);
    }

    getInput() {
        return this.inputBytes;
    }

    getRegisterBank() {
        return this.registerBank;
    }

    getMemory() {
        return this.memory;
    }

    getCarry() {
        return this.carry;
    }

    setWaitingInput(waitingInput) {
        this.waitingInput = waitingInput;
        this.emit('waiting input', this.waitingInput);
    }

    setCarry(carry) {
        this.carry = carry;
    }

    setPC(pc) {
        this.pc = (pc >>> 0) & this.architecture.getMask();
        this.emit('pc update', this.pc);
    }

    incrementPC(value) {
        this.setPC(this.getPC() + value);
    }

    getPC() {
        return this.pc;
    }
    
    setCycles(cycles) {
        this.cycles = cycles;
        this.emit('cycles update', this.cycles);
    }

    incrementCycles(value) {
        this.cycles += value;
        this.emit('cycles update', this.cycles);
    }

    getCycles() {
        return this.cycles;
    }

    getArchitecture() {
        return this.architecture;
    }

    setBreakpointHandler(handler) {
        if (!handler) return this.breakpointHandler = defaultBreakpointHandler;
        if (typeof handler != 'function') throw new Error('handler isnt function');
        this.breakpointHandler = handler;
    }

    setStepInterval(ms) {
        this.stepInterval = ms;
    }

    getStepInterval() {
        return this.stepInterval;
    }
}