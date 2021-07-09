let pseudos = [];

function setup() {
    const pseudosMs = require.context('./', true, /pseudos\/.+\.js$/);
    pseudos = pseudosMs.keys().map(key => pseudosMs(key, true).default);
}

function getPseudoInstructions() {
    return pseudos;
}

const pseudoManager = {
    setup,
    getPseudoInstructions,
};

export default pseudoManager;