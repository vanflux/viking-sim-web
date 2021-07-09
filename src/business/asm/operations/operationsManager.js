
let basicOps = [];
let pseudoOps = [];
let basicOpsByOpcode = {};
let basicOpsByName = {};
let pseudoOpsByName = {};
let basicOpsNames = [];
let pseudoOpsNames = [];
let opsNames = [];

function setup() {
    const basicMs = require.context('./', true, /basic\/.+\.js$/);
    basicOps = basicMs.keys().map(key => basicMs(key, true).default);
    const pseudoMs = require.context('./', true, /pseudo\/.+\.js$/);
    pseudoOps = pseudoMs.keys().map(key => pseudoMs(key, true).default);

    basicOpsByOpcode = Object.fromEntries(
        basicOps.map(op => [
            op.getOpcode(), // key
            op              // value
        ])
    );

    basicOpsByName = Object.fromEntries(
        basicOps.map(op => [
            op.getName(),   // key
            op              // value
        ])
    );
    pseudoOpsByName = Object.fromEntries(
        pseudoOps.map(op => [
            op.getName(),   // key
            op              // value
        ])
    );

    basicOpsNames = Object.keys(basicOpsByName);
    pseudoOpsNames = Object.keys(pseudoOpsByName);
    opsNames = basicOpsNames.concat(pseudoOpsNames);
}

function getOperationNames() {
    return opsNames;
}

function getOperationByName(name) {
    return basicOpsByName[name] || pseudoOpsByName[name];
}

function getBasicOperationByName(name) {
    return basicOpsByName[name];
}

function getPseudoOperationByName(name) {
    return pseudoOpsByName[name];
}

function isOperationName(name) {
    return getOperationByName(name) != null;
}

function isBasicOperationName(name) {
    return basicOpsByName[name] != null;
}

function isPseudoOperationName(name) {
    return pseudoOpsByName[name] != null;
}

function getOperationByOpcode(opcode) {
    return basicOpsByOpcode[opcode];
}

const operationsManager = {
    setup,
    getOperationNames,
    getOperationByName,
    getBasicOperationByName,
    getPseudoOperationByName,
    isOperationName,
    isBasicOperationName,
    isPseudoOperationName,
    getOperationByOpcode,
};

export default operationsManager;