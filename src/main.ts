import {
    getCoinbaseTransaction,
    signTxIn,
    processTransactions,
    Transaction,
    UnspentTxOut, getPublicKey, getTransactionId, COINBASE_AMOUNT
} from './transactions';
import {
    generateNextBlock,
    isValidChain,
    getBlockchain,
    replaceChain
} from './block_chain';
import * as ecdsa from 'elliptic';
const ec = new ecdsa.ec('secp256k1');

// Generate a private key
const aprivateKey= 'f5e2b3f67e9d1d2a3c01ef9a0f2a96c8e7f37cde6e295d65e8269302c9f8b5e0'; // Replace with your private key
const keyPair = ec.keyFromPrivate(aprivateKey, 'hex');

// Get the public key
const publicKey = keyPair.getPublic().encode('hex', false);
const privateKey ='f3e2b3f67e9d1d2a3c01ef9a0f2a96c8e7f37cde6e295d65e8269302c9f9b5e0';
const address = getPublicKey(privateKey)
console.log(address.length)
// Create a new coinbase transaction for the first block
console.log('create new Coinbase')
const coinbaseTx = getCoinbaseTransaction(address, 0);
console.log('Coinbase Transaction:', coinbaseTx);

// Create a new transaction
const tx1 = new Transaction();
tx1.txIns = [
    { txOutId: coinbaseTx.id, txOutIndex: 0, signature: '' } // Reference the coinbase transaction output
];
tx1.txOuts = [
    { address: publicKey, amount:COINBASE_AMOUNT  }, // Amount to send
];
tx1.id=getTransactionId(tx1);

// Define Unspent Transaction Outputs
const unspentTxOuts: UnspentTxOut[] = [
    new UnspentTxOut(coinbaseTx.id, 0, address, 50), // Add a valid unspent transaction output
];

// Sign the transaction input
const txIn = tx1.txIns[0]; // Get the first transaction input
const signature = signTxIn(tx1, txIn.txOutIndex, privateKey, unspentTxOuts); // Sign the transaction input
txIn.signature = signature; // Assign the signature to the transaction input

// Set the block index for the transaction processing
const blockIndex = 0;

// Process the transactions and update the unspent transaction outputs
const updatedUnspentTxOuts = processTransactions([tx1], unspentTxOuts, blockIndex);
if (updatedUnspentTxOuts) {
    console.log('Updated Unspent Transaction Outputs:', updatedUnspentTxOuts);
}
// Display the current blockchain
console.log('Current Blockchain:', JSON.stringify(getBlockchain(), null, 2));

// Generate the next block
const newBlock = generateNextBlock([tx1]);
console.log('New Block Added:', newBlock);

// Validate the blockchain
const isChainValid = isValidChain(getBlockchain());
console.log('Is Blockchain Valid:', isChainValid);

// Display the current blockchain
console.log('Current Blockchain:', JSON.stringify(getBlockchain(), null, 2));


