const sub = {
    getName() {
        return 'sub';
    },
    getOpcode() {
        return 0x6000;
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
            registerBank.getValue(rsa) - registerBank.getValue(rsb),
        );
    },
    async executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rst) - immediate,
        );
    },
}

export default sub;