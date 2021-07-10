import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationBez = operationsManager.getOperationByName('bez');
const operationLdi = operationsManager.getOperationByName('ldi');

const bez = {
    getOperation: () => operationBez,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationBez.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 2) return [];
        
        if (operands[0].getType() === 'register') {
            switch (operands[1].getType()) {
                case 'register':
                    // bez r1, r2 -> [ bez r0, r1, r2 ]
                    return [
                        new Instruction(operationBez, [ new Operand('r0', Operand.REGISTER), operands[0], operands[1] ]),
                    ];
                case 'symbol':
                    // bez r1, sym -> [ ldi at, sym   bez r0, r1, at ]
                    return [
                        new Instruction(operationLdi, [ new Operand('at', Operand.REGISTER), operands[1] ]),
                        new Instruction(operationBez, [ new Operand('r0', Operand.REGISTER), operands[0], new Operand('at', Operand.REGISTER) ]),
                    ];
                default:
            }
        }
        return [];
    },
};

export default bez;