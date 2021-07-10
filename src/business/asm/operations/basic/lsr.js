const lsr = {
    getName() {
        return 'lsr';
    },
    getOpcode() {
        return 0xA000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        let value = registerBank.getValue(rsa);
        simulation.setCarry(value & 1);
        registerBank.setValue(
            rst, 
            value >>> 1,
        );
    },
}

export default lsr;