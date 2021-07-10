import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationLsr = operationsManager.getOperationByName('lsr');

const lsr = {
    getOperation: () => operationLsr,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationLsr.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 2) return [];

        return [
            new Instruction(operationLsr, [ operands[0], operands[1], new Operand('r0', Operand.REGISTER) ]),
        ];
    },
};

export default lsr;