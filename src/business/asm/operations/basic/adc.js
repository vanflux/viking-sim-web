const adc = {
    getName() {
        return 'adc';
    },
    getOpcode() {
        return 0x5001;
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
            registerBank.getValue(rsa) + registerBank.getValue(rsb) + carry,
        );
    },
}

export default adc;