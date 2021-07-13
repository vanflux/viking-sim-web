import { EventEmitter } from 'events';
import utils from '../../../utils';

export default class RegisterBank extends EventEmitter {

    static createFromArchitecture (architecture, ...args) {
        let archRegisters = architecture.getRegisters();
        return new RegisterBank(archRegisters, architecture.getByteWidth(), ...args);
    }

    constructor (registerInfos, registerByteWidth) {
        super();
        this.registerInfos = registerInfos;
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
            let { aliases } = registerInfo;

            let register = {
                name: registerName,
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
        let register = this.registers[registerName];
        let oldValue = register.value;
        register.value = newValue;
        this.emit('value update', { registerName: register.name, oldValue, newValue });
    }

    getValue(registerName) {
        return utils.unsignedToSigned(this.registers[registerName].value, this.registerByteWidth);
    }
    
    getUValue(registerName) {
        return this.registers[registerName].value;
    }
}