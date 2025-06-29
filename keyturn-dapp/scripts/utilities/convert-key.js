const { Keypair } = require('@solana/web3.js');

// Your base58 private key
const base58Key = '3J9AC3WCdRdfU4ckqLihGC9WU2wDRRp8iroVBftemSeuB1fEE3uiRh5geHvojoxS2ZxGg6fqPcC8oeAoWrfUbGqG';

// Create keypair from base58 string
const keypair = Keypair.fromSecretKey(
  Buffer.from(base58Key, 'base64')
);

// Get the secret key as array
const keyArray = Array.from(keypair.secretKey);

console.log('Converted private key array:');
console.log(JSON.stringify(keyArray));

console.log('\nFor your .env.local file, use:');
console.log(`WALLET_PRIVATE_KEY=${JSON.stringify(keyArray)}`);

console.log('\nWallet public key:', keypair.publicKey.toString()); 