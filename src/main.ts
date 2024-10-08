import { generateNextBlock, getBlockchain, createInvalidChain, createValidChain, replaceChain, isValidChain } from './block_chain';

// Initialize the blockchain and add new blocks
console.log('Blockchain initialized with the genesis block.');

// Generate new blocks
generateNextBlock('First block after genesis');
generateNextBlock('Second block after genesis');

// Log the current blockchain state before replacement
console.log('Current blockchain before replacement:', getBlockchain());


//Testing replacechain
const validChain = createValidChain();
isValidChain(validChain);
replaceChain(validChain);

// Log the current blockchain state after the valid replacement attempt
console.log('Current blockchain after valid replace attempt:', getBlockchain());

// Test replacing the chain with an invalid one
console.log('Testing with an invalid chain:');
const invalidChain = createInvalidChain();
isValidChain(invalidChain)
replaceChain(invalidChain);

// Log the current blockchain state after the invalid replacement attempt
console.log('Current blockchain after invalid replace attempt:', getBlockchain());


