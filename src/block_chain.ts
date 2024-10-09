import CryptoJS from 'crypto-js';
import {hexToBinary} from './utils';
import {UnspentTxOut, Transaction, processTransactions} from './transactions'

export class Block {
    
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: Transaction[];
    public difficulty: number;
    public nonce: number;

    constructor(index: number, hash: string, previousHash: string,
                timestamp: number, data:Transaction[], difficulty: number, nonce: number) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    } 
}

export const calculateHash = (index: number, previousHash: string, timestamp: number, data: Transaction[],
    difficulty: number, nonce: number): string =>
CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

// Create the genesis block with a calculated hash
const genesisBlock: Block = new Block(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [], 0, 0
);

export let blockchain: Block[] = [genesisBlock];
export let unspentTxOuts: UnspentTxOut[] = [];
export const getBlockchain = (): Block[] => blockchain;
export const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

export const BLOCK_GENERATION_INTERVAL: number = 10;
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 3;
const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
    const prevAdjustmentBlock: Block = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        console.log("difficulty is adjusted to be increased")
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        console.log("difficulty is adjusted to be decreased")
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        console.log("difficulty isn't adjusted")
        return prevAdjustmentBlock.difficulty;
    }
};
const hashMatchesBlockContent = (block: Block): boolean => {
    const blockHash: string = calculateHash(block.index, block.previousHash,block.timestamp,block.data,block.difficulty, block.nonce);
    return blockHash === block.hash;
};
export const hasValidHash = (block: Block): boolean => {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
        return true;
    
    
};
const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'object';
};
const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < Math.floor(new Date().getTime() / 1000);
};
export const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid structure');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    } else if (!hasValidHash(newBlock)) {
        console.log('invalid Hash');
        return false;
    }
    return true;
};
export const addBlock = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        console.log(newBlock.index)
        const retVal = processTransactions(newBlock.data, unspentTxOuts, newBlock.index);
        if (retVal === null) {
            console.log('Transaction processing failed for block:', newBlock);
            return false;
        } else {
            blockchain.push(newBlock);
            unspentTxOuts = retVal;
            return true;
        }
    }
    console.log('Invalid new block:', newBlock);
    return false;
};
export const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = hexToBinary(hash)!;
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};

export const getAccumulatedDifficulty = (aBlockchain: Block[]): number => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};
export const findBlock = (index: number, previousHash: string, timestamp: number, data: Transaction[], difficulty: number): Block => {
    let nonce = 0;
    while (true) {
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            const hashInBinary: string = hexToBinary(hash)!;
            console.log(`Block found! Nonce: ${nonce}, Hash: ${hash}`);
            console.log(`Proof of Work: Difficulty: ${difficulty}, Hash: ${hash}, Binary: ${hashInBinary}`);
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};
export const generateNextBlock = (blockData: Transaction[]) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = Math.floor(new Date().getTime() / 1000);
    const difficulty: number = getDifficulty(getBlockchain());
    const newBlock: Block = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
    if(addBlock(newBlock)) {
        return newBlock;
    } else {
        return null;
    }
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

