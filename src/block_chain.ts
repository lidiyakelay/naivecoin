import CryptoJS from 'crypto-js';

export class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}

export const calculateHash = (index: number, previousHash: string, timestamp: number, data: string): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

// Create the genesis block with a calculated hash
const genesisBlock: Block = new Block(
    0,
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
    '',
    1465154705,
    'my genesis block!!'
);

export let blockchain: Block[] = [genesisBlock];

export const getBlockchain = (): Block[] => blockchain;
export const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

export const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number' &&
        typeof block.hash === 'string' &&
        typeof block.previousHash === 'string' &&
        typeof block.timestamp === 'number' &&
        typeof block.data === 'string';
};

export const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('Invalid block structure');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('Invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('Invalid previous hash');
        return false;
    } else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        console.log('Invalid hash:', calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data), 'Expected:', newBlock.hash);
        return false;
    }
    return true;
};

export const addBlock = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        console.log('Block added:', newBlock);
    } else {
        console.log('Block not added due to validation failure');
    }
};

export const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = Math.floor(new Date().getTime() / 1000);
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    addBlock(newBlock);
    return newBlock;
};

export const isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};
export const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
       
    } else {
        console.log('Received blockchain invalid');
    }
};

// Function to create a valid chain based on the current chain
export const createValidChain = (): Block[] => {
    const newBlockchain = [...getBlockchain()]; // Clone the current blockchain

    // Manually create valid blocks without adding them to the global blockchain
    const previousBlock = newBlockchain[newBlockchain.length - 1];
    const newBlock1 = new Block(
        previousBlock.index + 1,
        calculateHash(previousBlock.index + 1, previousBlock.hash, Math.floor(new Date().getTime() / 1000), 'Valid block 1'),
        previousBlock.hash,
        Math.floor(new Date().getTime() / 1000),
        'Valid block 1'
    );
    newBlockchain.push(newBlock1);

    const newBlock2 = new Block(
        newBlock1.index + 1,
        calculateHash(newBlock1.index + 1, newBlock1.hash, Math.floor(new Date().getTime() / 1000), 'Valid block 2'),
        newBlock1.hash,
        Math.floor(new Date().getTime() / 1000),
        'Valid block 2'
    );
    newBlockchain.push(newBlock2);

    return newBlockchain;
};

// Function to create an invalid chain
export const createInvalidChain = (): Block[] => {
    const newBlockchain = [...getBlockchain()]; // Clone the current blockchain

    // Create a block with an incorrect previous hash manually
    const previousBlock = newBlockchain[newBlockchain.length - 1];
    const invalidBlock = new Block(
        previousBlock.index + 1,
        calculateHash(previousBlock.index + 1, 'incorrectPreviousHash', Math.floor(new Date().getTime() / 1000), 'Invalid block'),
        'incorrectPreviousHash',
        Math.floor(new Date().getTime() / 1000),
        'Invalid block'
    );
    newBlockchain.push(invalidBlock);

    return newBlockchain;
};