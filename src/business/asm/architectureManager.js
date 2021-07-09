import Architecture from './architecture';

let _16;
let _32;

function setup() {
    _16 = new Architecture({
        bitWidth: 16,
        registers: {
            'r0': { code: 0, aliases: [ 'at' ] },
            'r1': { code: 1, aliases: [] },
            'r2': { code: 2, aliases: [] },
            'r3': { code: 3, aliases: [] },
            'r4': { code: 4, aliases: [] },
            'r5': { code: 5, aliases: [ 'sr' ] },
            'r6': { code: 6, aliases: [ 'lr' ] },
            'r7': { code: 7, aliases: [ 'sp' ] },
        },
    });
    _32 = new Architecture({
        bitWidth: 32,
        registers: {
            'r0': { code: 0, aliases: [ 'at' ] },
            'r1': { code: 1, aliases: [] },
            'r2': { code: 2, aliases: [] },
            'r3': { code: 3, aliases: [] },
            'r4': { code: 4, aliases: [] },
            'r5': { code: 5, aliases: [ 'sr' ] },
            'r6': { code: 6, aliases: [ 'lr' ] },
            'r7': { code: 7, aliases: [ 'sp' ] },
        },
    });
}

function getViking16Arch() {
    return _16;
}

function getViking32Arch() {
    return _32;
}

const architectureManager = {
    setup,
    getViking16Arch,
    getViking32Arch,
};

export default architectureManager;