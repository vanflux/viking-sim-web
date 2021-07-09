import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationStw = operationsManager.getOperationByName('stw');
const operationLdi = operationsManager.getOperationByName('ldi');

export default {
    getOperation: () => operationStw,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() != operationStw.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        if (operands[0].getType() == 'register') {
            switch (operands[1].getType()) {
                case 'register':
                    // stw r1, r2 -> [ stw r0, r1, r2 ]
                    return [
                        new Instruction(operationStw, [ new Operand('r0', Operand.REGISTER), operands[0], operands[1] ]),
                    ];
                    break;
                case 'symbol':
                case 'literal':
                    // stw r1, lit -> [ ldi at, lit   stw r0, r1, at ]
                    return [
                        new Instruction(operationLdi, [ new Operand('at', Operand.REGISTER), operands[1] ]),
                        new Instruction(operationStw, [ new Operand('r0', Operand.REGISTER), operands[0], new Operand('at', Operand.REGISTER) ]),
                    ];
                    break;
            }
        }
        return [];
    },
};