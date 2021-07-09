import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationBnz = operationsManager.getOperationByName('bnz');
const operationLdi = operationsManager.getOperationByName('ldi');

export default {
    getOperation: () => operationBnz,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() != operationBnz.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        if (operands[0].getType() == 'register') {
            switch (operands[1].getType()) {
                case 'register':
                    // bnz r1, r2 -> [ bnz r0, r1, r2 ]
                    return [
                        new Instruction(operationBnz, [ new Operand('r0', Operand.REGISTER), operands[0], operands[1] ]),
                    ];
                    break;
                case 'symbol':
                    // bnz r1, sym -> [ ldi at, sym   bnz r0, r1, at ]
                    return [
                        new Instruction(operationLdi, [ new Operand('at', Operand.REGISTER), operands[1] ]),
                        new Instruction(operationBnz, [ new Operand('r0', Operand.REGISTER), operands[0], new Operand('at', Operand.REGISTER) ]),
                    ];
                    break;
            }
        }
        return [];
    },
};