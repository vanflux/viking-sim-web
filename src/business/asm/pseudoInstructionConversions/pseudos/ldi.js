import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';
import utils from '../../../../utils';
const operation = operationsManager.getOperationByName('ldi');

const operationLdr = operationsManager.getOperationByName('ldr');
const operationLdc = operationsManager.getOperationByName('ldc');

const ldi = {
    getOperation: () => operation,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operation.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 2) return [];

        if (operands[0].getType() === 'register') {
            switch (operands[1].getType()) {
                case 'literal':
                    let literal = operands[1].getValue();
                    if (literal < 256 && literal > -128) {
                        // ldi r1, const -> ldr r1, const
                        // -128 < const < 256
                        return [
                            new Instruction(operationLdr, [ operands[0], operands[1] ]),
                        ];
                    } else {
                        // ldi r1, const -> [ ldr r1, const(first byte)   ldc r1, const(second byte) ]  (16 bits)
                        // -128 >= const <= 256

                        let bytes = utils.numberToBytes(literal, architecture.getByteWidth());
                        if (bytes.length === 0) throw new Error('Convert number to bytes error');
                        //bytes = utils.removeFirstZeroes(bytes);
                        if (bytes.length === 0) {
                            return [ new Instruction(operationLdr, [ operands[0], new Operand(0, Operand.LITERAL) ]) ]
                        } else {
                            return [
                                new Instruction(operationLdr, [ operands[0], new Operand(bytes.shift(), Operand.LITERAL) ]),
                                ...bytes.map(byte => new Instruction(operationLdc, [ operands[0], new Operand(byte, Operand.LITERAL) ])),
                            ];
                        }
                    }
                case 'symbol':
                    // ldi r1, sym -> [ ldc r1, sym+0(1 byte)   ldc r1, sym+1(1 byte) ]
                    return new Array(architecture.getByteWidth()).fill(0).map(
                        (x, i) => {
                            return new Instruction(operationLdc, [ 
                                operands[0], 
                                new Operand(operands[1].getValue(), Operand.SYMBOL).setByteRange({ min: i, max: i}),
                            ]);
                        }
                    );
                default:
            }
        }
        return [];
    },
};

export default ldi;