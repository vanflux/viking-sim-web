export default class LineParser {

    constructor(instructionParser, dataParser, commentParser) {
        this.instructionParser = instructionParser;
        this.dataParser = dataParser;
        this.commentParser = commentParser;
    }

    getSymbolAndRest(str) {
        let symbol;
        let rest;

        let match = str.match(/^(\w*)[\t ]*(.*)/);
        if (Array.isArray(match) && match.length >= 3) {
            if (this.instructionParser.isOperationName(match[1])) {
                symbol = null;
                rest = match[1] + ' ' + match[2];
            } else {
                symbol = match[1];
                rest = match[2];
                if (symbol.length === 0) symbol = null;
            }
        } else {
            throw new Error('Cant parse line to symbol and rest');
        }
        
        return { symbol, rest };
    }

    parse(line) {
        // Extract symbols
        let result = this.getSymbolAndRest(line);
        let { symbol } = result;
        let sanitizedRest = result.rest.trim();

        // Extract comments
        result = this.commentParser.parse(sanitizedRest);
        let { hasComment, comment } = result;
        sanitizedRest = result.rest.trim();
        
        // Extract instructions / data
        let instruction = null;
        let data = null;
        if (sanitizedRest.length > 0) {
            if (this.instructionParser.isInstruction(sanitizedRest)) {
                instruction = this.instructionParser.parse(sanitizedRest);
            } else {
                data = this.dataParser.parse(sanitizedRest);
            }
        }

        return { hasComment, comment, symbol, instruction, data };
    }
}