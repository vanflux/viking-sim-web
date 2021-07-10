const ldb = {
    getName() {
        return 'ldb';
    },
    getOpcode() {
        return 0x0002;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let memory = simulation.getMemory();

        registerBank.setValue(rst, await memory.readByte(registerBank.getUValue(rsb)));
    },
}

export default ldb;