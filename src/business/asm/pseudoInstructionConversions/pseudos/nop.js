import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationAnd = operationsManager.getOperationByName('and');
const operationNop = operationsManager.getOperationByName('nop');

const nop = {
    getOperation: () => operationNop,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationNop.getName()) return [];
        
        return [
            new Instruction(operationAnd, [ new Operand('r0', Operand.REGISTER), new Operand('r0', Operand.REGISTER), new Operand('r0', Operand.REGISTER) ] ),
        ];
    },
};

export default nop;