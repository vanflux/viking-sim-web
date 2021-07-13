const stb = {
    getName() {
        return 'stb';
    },
    getOpcode() {
        return 0x1002;
    },
    isPseudo() {
        return false;
    },
    supportR: () => true,
    supportI: () => false,
    executeR(simulation, rst, rsa, rsb) {
        let registerBank = simulation.getRegisterBank();
        let memory = simulation.getMemory();

        memory.writeByte(registerBank.getUValue(rsb), registerBank.getUValue(rsa));
    },
}

export default stb;