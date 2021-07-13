const xor = {
    getName() {
        return 'xor';
    },
    getOpcode() {
        return 0x2000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => true,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rsa) ^ registerBank.getUValue(rsb),
        );
    },
    executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rst) ^ immediate,
        );
    },
}

export default xor;