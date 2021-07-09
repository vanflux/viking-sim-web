import { EventEmitter } from 'events';
import MemoryStorage16 from './memoryStorage16';

class Memory extends EventEmitter {
    static createFromArchitecture (architecture, ...args) {
        let bitWidth = architecture.getBitWidth();
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
        return new Memory(storage);
    }

    constructor(storage) {
        super();
        this.storage = storage;
    }

    async reset(...args) {
        this.emit('reset');
        return this.storage.reset(...args);
    }
    
    async getDataLength(...args) {
        return this.storage.getDataLength(...args);
    }
    
    async getBytesFromRange(...args) {
        return this.storage.getBytesFromRange(...args);
    }
    
    async getWordsFromRange(...args) {
        return this.storage.getWordsFromRange(...args);
    }
    
    async readByte(address) {
        if (this.onReadByte) {
            let newValue = await this.onReadByte(address);
            if (newValue != null) {
                return newValue;
            }
        }
        this.emit('storage read byte', address);
        return this.storage.readByte(address);
    }
    
    async readWord(address) {
        if (this.onReadWord) {
            let newValue = await this.onReadWord(address);
            if (newValue != null) {
                return newValue;
            }
        }
        this.emit('storage read word', address);
        return this.storage.readWord(address);
    }

    async writeByte(address, byte) {
        if (this.onWriteByte) {
            if (!await this.onWriteByte(address, byte)) {
                return false;
            }
        }
        this.emit('storage write byte', address, byte);
        this.storage.writeByte(address, byte);
        return true;
    }
    
    async writeWord(address, word) {
        if (this.onWriteWord) {
            if(!await this.onWriteWord(address, word)) {
                return false;
            }
        }
        this.emit('storage write word', address, word);
        this.storage.writeWord(address, word);
        return true;
    }
}

export default Memory;