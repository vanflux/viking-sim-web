const sbc = {
    getName() {
        return 'sbc';
    },
    getOpcode() {
        return 0x6001;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let carry = simulation.getCarry();

        registerBank.setValue(
            rst, 
            registerBank.getValue(rsa) - registerBank.getValue(rsb) - carry,
        );
    },
}

export default sbc;