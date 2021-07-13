const slt = {
    getName() {
        return 'slt';
    },
    getOpcode() {
        return 0x3000;
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
            registerBank.getValue(rsa) < registerBank.getValue(rsb) ? 1 : 0,
        );
    },
    executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rst) < immediate ? 1 : 0,
        );
    },
}

export default slt;