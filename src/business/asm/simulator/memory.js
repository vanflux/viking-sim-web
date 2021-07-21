import { EventEmitter } from 'events';
import MemoryStorage16 from './memoryStorage16';

class Memory extends EventEmitter {
    static createFromArchitecture (architecture, ...args) {
        let bitWidth = architecture.getBitWidth();
        let memoryRegions = architecture.getMemoryRegions();
        let storage;
        switch (bitWidth) {
            case 16:
                storage = new MemoryStorage16();
                break;
            /*case 32:
                storage = new MemoryStorage16();
                break;*/
            default:
                throw new Error('Memory for this architecture doesnt exists (implementation doesnt exists)');
        }
        return new Memory(storage, memoryRegions);
    }

    constructor(storage, memoryRegions) {
        super();
        this.storage = storage;
        this.memoryRegions = memoryRegions;
    }

    getMemoryRegions() {
        return this.memoryRegions;
    }

    reset(...args) {
        let result = this.storage.reset(...args);
        this.emit('reset');
        return result;
    }
    
    getDataLength(...args) {
        return this.storage.getDataLength(...args);
    }
    
    getBytesFromRange(...args) {
        return this.storage.getBytesFromRange(...args);
    }
    
    getWordsFromRange(...args) {
        return this.storage.getWordsFromRange(...args);
    }
    
    readByte(address) {
        if (this.onReadByte) {
            let newValue = this.onReadByte(address);
            if (newValue != null) {
                return newValue;
            }
        }
        let result = this.storage.readByte(address);
        this.emit('storage read byte', address);
        return result;
    }
    
    readWord(address) {
        if (this.onReadWord) {
            let newValue = this.onReadWord(address);
            if (newValue != null) {
                return newValue;
            }
        }
        let result = this.storage.readWord(address);
        this.emit('storage read word', address);
        return result;
    }

    writeByte(address, byte) {
        if (this.onWriteByte) {
            if (!this.onWriteByte(address, byte)) {
                return false;
            }
        }
        let result = this.storage.writeByte(address, byte);
        this.emit('storage write byte', address, byte);
        return result;
    }
    
    writeWord(address, word) {
        if (this.onWriteWord) {
            if(!this.onWriteWord(address, word)) {
                return false;
            }
        }
        let result = this.storage.writeWord(address, word);
        this.emit('storage write word', address, word);
        return result;
    }
}

export default Memory;