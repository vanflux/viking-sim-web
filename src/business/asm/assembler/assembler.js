import Operand from '../operand';
import InstructionParser from './instructionParser';
import DataParser from './dataParser';
import CommentParser from './commentParser';
import LineParser from './lineParser';
import utils from '../../../utils';

class Assembler {
    constructor(architecture, programData, pseudoConverter) {
        this.architecture = architecture;
        this.programData = programData;
        this.pseudoConverter = pseudoConverter;
        this.extraSymbolTable = {};
        
        this.lines = this.programData.split('\n');
        
        this.sequence = [];
        this.symbolTable = {};
        this.objectCodeArray = [];
        this.instructions = [];
        this.additionalInfos = [];
    }

    assemble() {
        this.pass1();
        this.pass2();
        this.pass3();
        
        return {
            rawObjectCode: this.rawObjectCode,
            objectCodeArray: this.objectCodeArray,
            symbolTable: this.symbolTable,
            instructions: this.instructions,
            additionalInfos: this.additionalInfos,
        };
    }

    addExtraSymbolTable(symbolTable) {
        Object.assign(this.extraSymbolTable, symbolTable);
    }

    // Process instructions, pseudo-instructions, symbols.
    // Doesnt substitute symbols in instructions.
    pass1() {
        let pc = 0;

        let instructionParser = new InstructionParser(this.architecture);
        let dataParser = new DataParser(this.architecture);
        let commentParser = new CommentParser();
        let lineParser = new LineParser(instructionParser, dataParser, commentParser);

        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            let additionalInfo = { lineIndex: i, lineNumber: i+1, line, pc };
            this.additionalInfos.push(additionalInfo);

            let parsed;
            try {
                parsed = lineParser.parse(line);
            } catch (exc) {
                console.error(exc);
                throw new Error('Cant parse line ' + (i+1) + ' "' + line.trim() + '": ' + exc.message);
            }
            let { symbol, instruction, data } = parsed;
            additionalInfo.parsed = parsed;

            if (symbol) {
                this.symbolTable[symbol] = pc;
            }
            if (data) {
                this.sequence.push(...data);
                pc += 2 * data.length;
            }
            if (instruction) {
                // process pseudo instructions
                if (instruction.isPseudo()) {
                    let convInstructions = this.pseudoConverter.convert(instruction, this.architecture);
                    if (convInstructions != null && convInstructions.length > 0) {
                        this.instructions.push(...convInstructions);
                        this.sequence.push(...convInstructions);
                        pc += 2 * convInstructions.length;
                    } else {
                        throw new Error('The pseudo instruction on line ' + (i+1) + ' "' + line.trim() + '" doesnt exist');
                    }
                } else {
                    this.instructions.push(instruction);
                    this.sequence.push(instruction);
                    pc += 2;
                }
            }
        }
    }

    // Substitute symbols with their values
    pass2() {
        for (let instruction of this.instructions) {
            let operands = instruction.getOperands();
            for (let operand of operands) {
                if (operand.getType() === Operand.SYMBOL) {
                    let symbolValue = this.symbolTable[operand.getValue()];
                    if (symbolValue == null) symbolValue = this.extraSymbolTable[operand.getValue()];
                    if (symbolValue == null) throw new Error('The symbol "' + operand.getValue() + '" doesnt exist');
                    let finalValue = 0;
                    for (let i = operand.getByteRange().min; i <= operand.getByteRange().max; i++) {
                        finalValue <<= 2;
                        finalValue |= (symbolValue >> (this.architecture.getBitWidth() - (8 * (i + 1)))) & 0xFF;
                    }
                    operand.setType(Operand.LITERAL);
                    operand.setValue(finalValue);
                }
            }
        }
    }

    // Assemble object code
    pass3() {
        // Assemble
        for (let item of this.sequence) {     
            if (Number.isInteger(item)) {
                this.objectCodeArray.push(item);
            } else {
                this.objectCodeArray.push(item.assemble(this.architecture));
            }
        }
        
        this.rawObjectCode = this.objectCodeArray
            .map(x => utils.signedNumberToHex(x, 2))
            .join('');
    }
};

export default Assembler;