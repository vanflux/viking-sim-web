import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationLsl = operationsManager.getOperationByName('lsl');
const operationAdd = operationsManager.getOperationByName('add');

export default {
    getOperation: () => operationLsl,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() != operationLsl.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        if (operands[0].getType() == 'register') {
            switch (operands[1].getType()) {
                case 'register':
                    // lsl r1, r2 -> [ add r1, r2, r2 ]
                    return [
                        new Instruction(operationAdd, [ operands[0], operands[1], operands[1] ]),
                    ];
                    break;
            }
        }
        return [];
    },
};