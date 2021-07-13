const or = {
    getName() {
        return 'or';
    },
    getOpcode() {
        return 0x1000;
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
            registerBank.getValue(rsa) | registerBank.getValue(rsb),
        );
    },
    executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rst) | immediate,
        );
    },
}

export default or;