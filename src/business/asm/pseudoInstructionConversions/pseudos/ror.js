import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationRor = operationsManager.getOperationByName('ror');

const ror = {
    getOperation: () => operationRor,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationRor.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 2) return [];

        return [
            new Instruction(operationRor, [ operands[0], operands[1], new Operand('r0', Operand.REGISTER) ]),
        ];
    },
};

export default ror;