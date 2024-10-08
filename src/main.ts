import { generateNextBlock, getBlockchain, getAccumulatedDifficulty } from './block_chain';

// Initialize the blockchain and add new blocks
console.log('Blockchain initialized with the genesis block.');

const generateMultipleBlocks = (count: number, prefix: string = 'Block') => {
    for (let i = 1; i <= count; i++) {
        const blockData = `${prefix} ${i} after genesis`;
        generateNextBlock(blockData);
    }
};
//The higher the accumulated difficulty the better
const displayAccumulatedDifficulty = () => {
    const accumulatedDifficulty = getAccumulatedDifficulty(getBlockchain());
    console.log(`the total amount of computational work required to produce all the blocks in a blockchain is: ${accumulatedDifficulty}`);
};
generateMultipleBlocks(20);
displayAccumulatedDifficulty();




