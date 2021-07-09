import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationLdw = operationsManager.getOperationByName('ldw');
const operationLdi = operationsManager.getOperationByName('ldi');

export default {
    getOperation: () => operationLdw,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() != operationLdw.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        if (operands[0].getType() == 'register') {
            switch (operands[1].getType()) {
                case 'register':
                    // ldw r1, r2 -> [ ldw r1, r0, r2 ]
                    return [
                        new Instruction(operationLdw, [ operands[0], new Operand('r0', Operand.REGISTER), operands[1] ]),
                    ];
                    break;
                case 'symbol':
                case 'literal':
                    // ldw r1, lit -> [ ldi at, lit   ldb r1, r0, at ]
                    return [
                        new Instruction(operationLdi, [ new Operand('at', Operand.REGISTER), operands[1] ]),
                        new Instruction(operationLdw, [ operands[0], new Operand('r0', Operand.REGISTER), new Operand('at', Operand.REGISTER) ]),
                    ];
                    break;
            }
        }
        return [];
    },
};