export default class Operand {
    static REGISTER = 'register';
    static SYMBOL = 'symbol';
    static LITERAL = 'literal';

    constructor(value, type) {
        this.value = value;
        this.type = type;
        this.byteRange = null;
    }

    setByteRange(byteRange) {
        this.byteRange = byteRange;
        return this;
    }

    setValue(value) {
        this.value = value;
        return this;
    }
    
    setType(type) {
        this.type = type;
        return this;
    }

    getValue() {
        return this.value;
    }
    
    getType() {
        return this.type;
    }

    getByteRange() {
        return this.byteRange;
    }
}