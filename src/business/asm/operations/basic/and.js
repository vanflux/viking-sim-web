export default {
    getName() {
        return 'and';
    },
    getOpcode() {
        return 0x0000;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => true,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rsa) & registerBank.getUValue(rsb),
        );
    },
    async executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rst) & immediate,
        );
    },
}