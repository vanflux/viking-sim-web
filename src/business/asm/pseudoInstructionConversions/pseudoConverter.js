
export default class PseudoConverter {
    constructor(pseudos) {
        this.pseudos = pseudos;
    }

    convert(instruction, architecture) {
        for (let pseudo of this.pseudos) {
            let instructions = pseudo.getNonPseudoInstructions(instruction, architecture);
            if (instructions.length > 0) {
                for (let i = 0; i < instructions.length; i++) {
                    let convInstruction = instructions[i];
                    let convInstructions = this.convert(convInstruction, architecture);

                    if (convInstructions.length > 0) {
                        instructions.splice(i, 1, ...convInstructions);
                    }
                }
                return instructions;
            }
        }
        return [];
    }
}