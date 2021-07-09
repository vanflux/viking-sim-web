import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

let supportedOpNames = new Set([ 'and', 'or', 'xor', 'slt', 'add', 'sub', 'bez', 'bnz' ]);

const operationLdi = operationsManager.getOperationByName('ldi');

export default {
    getNonPseudoInstructions: (instruction, architecture) => {
        if (!supportedOpNames.has(instruction.getOperation().getName())) return [];

        let operands = instruction.getOperands();
        if (operands.length != 2) return [];

        if (operands[0].getType() == 'register') {
            switch (operands[1].getType()) {
                case 'literal':
                    let literal = operands[1].getValue();
                    if (literal > 127 || literal < -128) {
                        return [
                            new Instruction(operationLdi, [ new Operand('at', Operand.REGISTER), new Operand(literal, Operand.LITERAL) ]),
                            new Instruction(instruction.getOperation(), [ operands[0], operands[0], new Operand('at', Operand.REGISTER) ]),
                        ];
                    }
                    break;
            }
        }

        return [];
    },
};