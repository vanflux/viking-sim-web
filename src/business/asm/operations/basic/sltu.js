export default {
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
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rsa) < registerBank.getUValue(rsb) ? 1 : 0,
        );
    },
    async executeI(simulation, rst, immediate) {
        let registerBank = simulation.getRegisterBank();

        registerBank.setValue(
            rst, 
            registerBank.getUValue(rst) < (immediate >>> 0) ? 1 : 0,
        );
    },
}