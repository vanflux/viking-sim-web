import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationMov = operationsManager.getOperationByName('mov');
const operationAnd = operationsManager.getOperationByName('and');

const mov = {
    getOperation: () => operationMov,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationMov.getName()) return [];
        
        let operands = instruction.getOperands();
        if (operands.length !== 2) return [];
        if (operands[0].type !== Operand.REGISTER) return [];
        if (operands[1].type !== Operand.REGISTER) return [];

        return [
            new Instruction(operationAnd, [ operands[0], operands[1], operands[1] ] ),
        ];
    },
};

export default mov;