const bez = {
    getName() {
        return 'bez';
    },
    getOpcode() {
        return 0xC000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => true,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        if (registerBank.getValue(rsa) === 0) {
            simulation.setPC(registerBank.getValue(rsb) - 2);
        }
    },
    executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        if (registerBank.getValue(rst) === 0) {
            simulation.setPC(simulation.getPC() + immediate);
        }
    },
}

export default bez;