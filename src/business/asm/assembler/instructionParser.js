import operationsManager from '../operations/operationsManager';
import Instruction from '../instruction';
import Operand from '../operand';
import utils from '../../utils';

export default class InstructionParser {

    constructor(architecture) {
        this.architecture = architecture;
    }

    isInstruction(str) {
        try {
            let operation = this.parseOperation(str);
            return operation != null;
        } catch (exc) {
            return false;
        }
    }
    
    parse(str) {
        // parse operation & operands
        let operation = this.parseOperation(str);
        let operands = this.parseOperands(str);

        let instruction = new Instruction(operation, operands);
        return instruction;
    }
    

    // detect if str is register
    isRegisterName(str) {
        return this.architecture.hasRegisterName(str);
    }

    // detect if str is operation
    isOperationName(str) {
        return operationsManager.isOperationName(str);
    }

    // parse operation
    parseOperation(str) {
        let match = str.match(/^(\w*)[\t ]*/);
        if (!Array.isArray(match) || match.length < 2) throw new Error('Cant parse to operation');

        let operationName = match[1];
        if (!this.isOperationName(operationName)) throw new Error('"' + operationName + '" isnt operation');
        
        let operation = operationsManager.getOperationByName(operationName);
        if (!operation) throw new Error('Operation with name "' + operationName + '" not found');

        return operation;
    }

    // detect type of operand value
    getInstructionOperandValueType(operandValue) {
        if (typeof operandValue !== 'string') return null;
        if (operandValue.length === 0) return null;

        if (this.isRegisterName(operandValue)) return 'register';
        if (utils.isInteger(operandValue)) return 'literal';
        return 'symbol';
    }
    
    // parse operands
    parseOperands(str) {
        let operands = [];

        let match = str.match(/^\w+[ \t]+(.+)/);
        if (Array.isArray(match) && match.length >= 2) {
            let operandsStr = match[1];
            let operandsValues = operandsStr.split(/[\t ]*,[\t ]*/);
            for (let value of operandsValues) {
                value = value.trim();
                let type = this.getInstructionOperandValueType(value);
                if (type === null) {
                    throw new Error('Operand "' + value + '" cant be parsed');
                }
                if (type === Operand.LITERAL) {
                    value = parseInt(value);
                }
                operands.push(new Operand(value, type));
            }
        }
        
        return operands;
    }
}