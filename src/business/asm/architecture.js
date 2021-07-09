export default class Architecture {
    constructor({ bitWidth, registers }) {
        this.bitWidth = bitWidth;
        this.byteWidth = bitWidth / 8;
        this.mask = Math.pow(2, bitWidth) - 1;

        this.registers = registers;

        this.registersByName = Object.fromEntries(
            Object.entries(registers)
            .map(([registerName, register]) => [
                [
                    registerName,   // key      registerName
                    register,       // value    register
                ],
                ...register.aliases.map(aliasName => [
                        aliasName,  // key      registerName
                        register,   // value    register
                    ]
                )
            ])
            .reduce((a, b) => a.concat(b))
        );
        this.registersNameByCode = Object.fromEntries(
            Object.entries(registers)
            .map(([registerName, register]) => [
                [
                    register.code,  // key      registerName
                    registerName,   // value    register
                ],
            ])
            .reduce((a, b) => a.concat(b))
        );
    }

    getMask() {
        return this.mask;
    }

    getBitWidth() {
        return this.bitWidth;
    }

    getByteWidth() {
        return this.byteWidth;
    }

    hasRegisterName(name) {
        return this.registersByName[name] != null;
    }

    getRegisterNames() {
        return Object.keys(this.registersByName);
    }

    getRegisters() {
        return this.registers;
    }

    getRegisterNameByCode(code) {
        return this.registersNameByCode[code];
    }

    getRegisterCode(name) {
        if (!this.hasRegisterName(name)) throw new Error('Register doesnt exists');
        return this.registersByName[name].code;
    }
}