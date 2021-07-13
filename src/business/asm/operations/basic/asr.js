const asr = {
    getName() {
        return 'asr';
    },
    getOpcode() {
        return 0xA001;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        let value = registerBank.getValue(rsa);
        simulation.setCarry(value & 1);
        registerBank.setValue(
            rst, 
            value >> 1,
        );
    },
}

export default asr;