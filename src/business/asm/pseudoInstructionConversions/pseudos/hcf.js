import operationsManager from '../../operations/operationsManager';
import Instruction from '../../instruction';
import Operand from '../../operand';

const operationHcf = operationsManager.getOperationByName('hcf');

const hcf = {
    getOperation: () => operationHcf,
    getNonPseudoInstructions: (instruction, architecture) => {
        if (instruction.getOperation().getName() !== operationHcf.getName()) return [];

        let operands = instruction.getOperands();
        if (operands.length !== 0) return [];

        // hcf -> [ ldb r0, r0, r0 ]
        return [
            new Instruction(operationHcf, [ 
                new Operand('r0', Operand.REGISTER), 
                new Operand('r0', Operand.REGISTER), 
                new Operand('r0', Operand.REGISTER)
            ]),
        ];
    },
};

export default hcf;