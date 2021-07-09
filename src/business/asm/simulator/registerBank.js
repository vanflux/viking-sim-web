import { EventEmitter } from 'events';
import utils from '../../utils';

export default class RegisterBank extends EventEmitter {

    static createFromArchitecture (architecture, ...args) {
        let archRegisters = architecture.getRegisters();
        return new RegisterBank(archRegisters, architecture.getByteWidth(), ...args);
    }

    constructor (registerInfos, registerByteWidth) {
        super();
        this.registerInfos = Object.assign({ pc: { code: null, aliases: [] }}, registerInfos); // Add the PC special register, if not exists
        this.registerByteWidth = registerByteWidth;
        this.setup();
    }

    getRegisterInfos() {
        return this.registerInfos;
    }

    getRegisterInfo(name) {
        return this.registerInfos[name];
    }

    setup() {
        this.mask = Math.pow(2, 8 * this.registerByteWidth) - 1;

        this.registers = {};
        for (let registerName in this.registerInfos) {
            let registerInfo = this.registerInfos[registerName];
            let { name, aliases } = registerInfo;

            let register = {
                name,
                aliases,
                value: 0,
            };

            this.registers[registerName] = register;
            aliases.forEach(aliasName => this.registers[aliasName] = register);
        }
    }

    reset() {
        for (let registerName in this.registers) {
            this.setValue(registerName, 0);
        }
    }

    setValue(registerName, newValue) {
        newValue = (newValue & this.mask) >>> 0;
        let oldValue = this.registers[registerName].value;
        this.registers[registerName].value = newValue;
        this.emit('value update', { registerName, oldValue, newValue });
    }

    getValue(registerName) {
        return utils.unsignedToSigned(this.registers[registerName].value, this.registerByteWidth);
    }
    
    getUValue(registerName) {
        return this.registers[registerName].value;
    }
}