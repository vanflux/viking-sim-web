const sltu = {
    getName() {
        return 'sltu';
    },
    getOpcode() {
        return 0x4000;
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
            registerBank.getUValue(rsa) < registerBank.getUValue(rsb) ? 1 : 0,
        );
    },
    executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rst) < (immediate >>> 0) ? 1 : 0,
        );
    },
}

export default sltu;