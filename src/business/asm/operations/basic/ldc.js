const ldc = {
    getName() {
        return 'ldc';
    },
    getOpcode() {
        return 0x9000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => false,
    supportI: () => true,
    async executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            (registerBank.getUValue(rst) << 8) | (immediate & 0xFF),
        );
    },
}

export default ldc;