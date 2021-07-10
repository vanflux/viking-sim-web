import Instruction from '../instruction';

class Disassembler {
    constructor(architecture) {
        this.architecture = architecture;
    }

    disassemble(rawHex) {
        if (rawHex.length === 0) return [];

        let result = [];
        let arrayLiteral = rawHex
            .match(/.{1,4}/g)
            .map(x => parseInt(x, 16));
        
        let pc = 0;
        for (let code of arrayLiteral) {
            let instruction;
            try {
                instruction = Instruction.disassemble(code, this.architecture);
            } catch (exc) { }

            let value = instruction ? instruction.toString() : '????';

            result.push({
                instruction,
                value,
                pc,
                code,
            });

            pc += 2;
        }

        return result;
    }
}

export default Disassembler;