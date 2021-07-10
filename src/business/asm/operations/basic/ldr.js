const ldr = {
    getName() {
        return 'ldr';
    },
    getOpcode() {
        return 0x8000;
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
            immediate,
        );
    },
}

export default ldr;