const ror = {
    getName() {
        return 'ror';
    },
    getOpcode() {
        return 0xA002;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let architecture = simulation.getArchitecture();

        let value = registerBank.getUValue(rsa);
        registerBank.setValue(
            rst, 
            (value >> 1) | (simulation.getCarry() << (architecture.getBitWidth() - 1)),
        );
        simulation.setCarry(value & 1);
    },
}

export default ror;