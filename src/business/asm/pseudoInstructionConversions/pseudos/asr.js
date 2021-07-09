import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationAsr = operationsManager.getOperationByName('asr');

export default {
    getOperation: () => operationAsr,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() != operationAsr.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        return [
            new Instruction(operationAsr, [ operands[0], operands[1], new Operand('r0', Operand.REGISTER) ] ),
        ];
    },
};