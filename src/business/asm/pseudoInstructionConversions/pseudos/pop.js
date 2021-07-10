import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationPop = operationsManager.getOperationByName('pop');
const operationLdw = operationsManager.getOperationByName('ldw');
const operationAdd = operationsManager.getOperationByName('add');

const pop = {
    getOperation: () => operationLdw,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationPop.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 1) return [];

        if (operands[0].getType() === 'register') {
            // pop r1 -> [ ldw r1, sp   add sp, 2 ]
            return [
                new Instruction(operationLdw, [ operands[0], new Operand('sp', Operand.REGISTER) ]),
                new Instruction(operationAdd, [ new Operand('sp', Operand.REGISTER), new Operand(2, Operand.LITERAL) ]),
            ];
        }
        return [];
    },
};

export default pop;