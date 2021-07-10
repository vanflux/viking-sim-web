const ldw = {
    getName() {
        return 'ldw';
    },
    getOpcode() {
        return 0x4002;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    async executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let memory = simulation.getMemory();

        registerBank.setValue(rst, await memory.readWord(registerBank.getUValue(rsb)));
    },
}

export default ldw;