export default {
    getName() {
        return 'stw';
    },
    getOpcode() {
        return 0x5002;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let memory = simulation.getMemory();

        await memory.writeWord(registerBank.getUValue(rsb), registerBank.getUValue(rsa));
    },
}