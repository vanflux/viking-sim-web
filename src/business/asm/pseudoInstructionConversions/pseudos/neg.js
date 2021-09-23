import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationNeg = operationsManager.getOperationByName('neg');
const operationXor = operationsManager.getOperationByName('xor');
const operationAdd = operationsManager.getOperationByName('add');

const neg = {
    getOperation: () => operationNeg,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationNeg.getName()) return [];
        
        let operands = instruction.getOperands();
        if (operands.length !== 1) return [];
        if (operands[0].type !== Operand.REGISTER) return [];

        return [
            new Instruction(operationXor, [ operands[0], new Operand(-1, Operand.LITERAL) ] ),
            new Instruction(operationAdd, [ operands[0], new Operand(1, Operand.LITERAL) ] ),
        ];
    },
};

export default neg;