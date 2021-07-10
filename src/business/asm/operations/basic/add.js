const add = {
    getName() {
        return 'add';
    },
    getOpcode() {
        return 0x5000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => true,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rsa) + registerBank.getValue(rsb),
        );
    },
    async executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rst) + immediate,
        );
    },
}

export default add;