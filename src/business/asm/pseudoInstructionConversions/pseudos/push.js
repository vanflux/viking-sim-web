import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationPush = operationsManager.getOperationByName('push');
const operationSub = operationsManager.getOperationByName('sub');
const operationStw = operationsManager.getOperationByName('stw');

const push = {
    getOperation: () => operationPush,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationPush.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 1) return [];

        if (operands[0].getType() === 'register') {
            // push r1 -> [ sub sb, 2   stw r1, sp ]
            return [
                new Instruction(operationSub, [ new Operand('sp', Operand.REGISTER), new Operand(2, Operand.LITERAL) ]),
                new Instruction(operationStw, [ operands[0], new Operand('sp', Operand.REGISTER) ]),
            ];
        }
        return [];
    },
};

export default push;