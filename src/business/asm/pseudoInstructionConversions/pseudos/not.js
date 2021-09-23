import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationNot = operationsManager.getOperationByName('not');
const operationXor = operationsManager.getOperationByName('xor');

const not = {
    getOperation: () => operationNot,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationNot.getName()) return [];
        
        let operands = instruction.getOperands();
        if (operands.length !== 1) return [];
        if (operands[0].type !== Operand.REGISTER) return [];

        return [
            new Instruction(operationXor, [ operands[0], new Operand(-1, Operand.LITERAL) ] ),
        ];
    },
};

export default not;