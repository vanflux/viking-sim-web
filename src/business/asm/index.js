import Instruction from './instruction';

import architectureManager from './architectureManager';
import operationsManager from './operations/operationsManager';
import pseudoManager from './pseudoInstructionConversions/pseudoManager';
import pseudoConverter from './pseudoInstructionConversions/pseudoConverter';

import assembler from './assembler/assembler';
import disassembler from './disassembler/disassembler';

import memory from './simulator/memory';
import memoryStorage16 from './simulator/memoryStorage16';
import registerBank from './simulator/registerBank';

import simulation from './simulator/simulation';

architectureManager.setup();
operationsManager.setup();
pseudoManager.setup();

const asm = {
    Instruction,
    architectureManager,
    operationsManager,
    pseudoManager,
    pseudoConverter,
    assembler,
    disassembler,
    memory,
    memoryStorage16,
    registerBank,
    simulation,
};

export default asm;