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
            symbol = match[1];
            rest = match[2];

            if (symbol.length == 0) symbol = null;
        } else {
            throw new Error('Cant parse line to symbol and rest');
        }
        
        return { symbol, rest };
    }

    parse(line) {
        let { symbol, rest } = this.getSymbolAndRest(line);
        let sanitizedRest = rest.trim();

        let instruction = null;
        let data = null;
        let { isComment, comment } = this.commentParser.parse(rest);

        if (!isComment) {
            if (sanitizedRest.length > 0) {
                if (this.instructionParser.isInstruction(sanitizedRest)) {
                    instruction = this.instructionParser.parse(sanitizedRest);
                } else {
                    data = this.dataParser.parse(sanitizedRest);
                }
            }
        }

        return { isComment, comment, symbol, instruction, data };
    }
}