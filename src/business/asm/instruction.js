import operationsManager from './operations/operationsManager';
import Operand from './operand';
import utils from '../utils';

class Instruction {
    static TYPE_R = 'R';
    static TYPE_I = 'I';
    
    static disassemble(code, architecture) {
        let imm = (code >> 11) & 0b1;    
        if (imm === 1) {
            let opcode = code & 0b1111000000000000;     // 1111 0000 0000 0000
            let rstCode = (code >> 8) & 0b111;          //      0111 0000 0000
            let immediate = code & 0b11111111;          //           1111 1111
            immediate = utils.unsignedToSigned(immediate, 1);
            
            let rst = architecture.getRegisterNameByCode(rstCode);
            
            if (!rst) throw new Error('rst doesnt exist');
    
            let operation = operationsManager.getOperationByOpcode(opcode);
            if (!operation) throw new Error('operation doesnt exist');
    
            let operands = [
                new Operand(rst, Operand.REGISTER),
                new Operand(immediate, Operand.LITERAL),
            ];
            
            return new Instruction(operation, operands);
        } else {
            let opcode = code & 0b1111000000000011;     // 1111 0000 0000 0011
            let rstCode = (code >> 8) & 0b111;          //      0111 0000 0000
            let rsaCode = (code >> 5) & 0b111;          //           1110 0000
            let rsbCode = (code >> 2) & 0b111;          //              1 1100
    
            let rst = architecture.getRegisterNameByCode(rstCode);
            let rsa = architecture.getRegisterNameByCode(rsaCode);
            let rsb = architecture.getRegisterNameByCode(rsbCode);
            if (!rst) throw new Error('rst doesnt exist');
            if (!rsa) throw new Error('rsa doesnt exist');
            if (!rsb) throw new Error('rsb doesnt exist');
    
            let operation = operationsManager.getOperationByOpcode(opcode);
            if (!operation) throw new Error('operation doesnt exist');
    
            let operands = [
                new Operand(rst, Operand.REGISTER),
                new Operand(rsa, Operand.REGISTER),
                new Operand(rsb, Operand.REGISTER),
            ];
    
            return new Instruction(operation, operands);
        }
    }

    constructor(operation, operands) {
        this.operation = operation;
        this.operands = operands;
    }
    
    isPseudo() {
        let type = this.getType();
        if (type === null) return true;
        if (this.operation === null) return true;
        if (this.operation.isPseudo()) return true;
        switch (type) {
            case Instruction.TYPE_R:
                if (!this.operation.supportR()) {
                    return true;
                } else {
                    break;
                }
            case Instruction.TYPE_I:
                if (!this.operation.supportI()) {
                    return true;
                } else {
                    break;
                }
            default:
                return false;
        }
    }

    getType() {
        if (this.operands.length === 2 && 
            this.operands[0].getType() === Operand.REGISTER &&
            this.operands[1].getType() === Operand.LITERAL) return Instruction.TYPE_I;
        if (this.operands.length === 3 && 
            this.operands[0].getType() === Operand.REGISTER &&
            this.operands[1].getType() === Operand.REGISTER &&
            this.operands[2].getType() === Operand.REGISTER) return Instruction.TYPE_R;
        return null;
    }

    assemble(architecture) {
        if (!this.operation) throw new Error('Operation doesnt exists');
        if (this.operation.getName() === 'hcf') return 0x0003;
        if (this.operation.isPseudo()) throw new Error('Operation is pseudo-operation');
        if (!this.operands) throw new Error('Operands doesnt exists');

        let type = this.getType();
        if (!type) throw new Error('Invalid instruction type');

        let opcode = this.operation.getOpcode();
        if (!type) throw new Error('Operation doesnt have opcode');

        let finalCode = 0x0000;
        switch (type) {
            case Instruction.TYPE_R: {
                let rst = architecture.getRegisterCode(this.operands[0].getValue());
                let rsa = architecture.getRegisterCode(this.operands[1].getValue());
                let rsb = architecture.getRegisterCode(this.operands[2].getValue());
                finalCode |= opcode;    // operation code
                finalCode |= 0 << 11;   // imm
                finalCode |= rst << 8;
                finalCode |= rsa << 5;
                finalCode |= rsb << 2;
                break;
            }
            case Instruction.TYPE_I: {
                let rst = architecture.getRegisterCode(this.operands[0].getValue());
                let immediate = this.operands[1].getValue();
                immediate = utils.signedToUnsigned(immediate, 1);

                finalCode |= opcode;    // operation code
                finalCode |= 1 << 11;   // imm
                finalCode |= rst << 8;
                finalCode |= immediate;
                break;
            }
            default:
        }
        return finalCode;
    }

    getOperation() {
        return this.operation;
    }
    
    getOperands() {
        return this.operands;
    }

    async execute(simulation) {
        if (!this.operation) throw new Error('Instruction has no operation');

        let type = this.getType();
        if (!type) throw new Error('Invalid instruction type');

        switch (type) {
            case Instruction.TYPE_R: {
                let rst = this.operands[0].getValue();
                let rsa = this.operands[1].getValue();
                let rsb = this.operands[2].getValue();
                
                if (typeof this.operation.executeR === 'function') {
                    await this.operation.executeR(simulation, rst, rsa, rsb);
                } else {
                    throw new Error('The operation "' + this.operation.getName() + '" doesnt support type R');
                }
                break;
            }
            case Instruction.TYPE_I: {
                let rst = this.operands[0].getValue();
                let immediate = this.operands[1].getValue();
                
                if (typeof this.operation.executeI === 'function') {
                    await this.operation.executeI(simulation, rst, immediate);
                } else {
                    throw new Error('The operation "' + this.operation.getName() + '" doesnt support type I');
                }
                break;
            }
            default:
        }
    }

    toString() {
        return this.operation.getName() + ' ' + this.operands.map(operand => {
            let value = operand.getValue();
            if (operand.getType() === Operand.LITERAL) {
                value = '0x'+utils.signedNumberToHex(value, 1);
            }
            return value;
        }).join(',');
    }
}

export default Instruction;