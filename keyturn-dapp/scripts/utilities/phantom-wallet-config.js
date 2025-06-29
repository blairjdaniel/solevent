const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

// Replace this with your actual Phantom private key
const PHANTOM_PRIVATE_KEY = "36d6XLGhomWvXEU9d1dPyUPjYAHf2PM9kTXyqwFuPyH2yP86WJdHYPCFEhBhMm1vSuywsfyBUXMCSnmprLWWHMgn"; // Paste your private key here

// Option 2: If you have the private key as array
// const PHANTOM_PRIVATE_KEY_ARRAY = [1, 2, 3, ...]; // Replace with your private key array

function createPhantomKeypair() {
  try {
    // Decode the base58 private key from Phantom
    const privateKeyBytes = bs58.decode(PHANTOM_PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // If you have array private key
    // const keypair = Keypair.fromSecretKey(new Uint8Array(PHANTOM_PRIVATE_KEY_ARRAY));
    
    console.log('✅ Phantom wallet loaded successfully!');
    console.log('Public Key:', keypair.publicKey.toString());
    
    return keypair;
  } catch (error) {
    console.error('❌ Error loading Phantom wallet:', error);
    console.log('Make sure you replaced YOUR_PHANTOM_PRIVATE_KEY_HERE with your actual private key');
    return null;
  }
}

// Test the wallet
console.log('Testing Phantom wallet...');
const testKeypair = createPhantomKeypair();
if (testKeypair) {
  console.log('✅ Wallet test successful!');
} else {
  console.log('❌ Wallet test failed!');
}

// Export for use in other scripts
module.exports = { createPhantomKeypair }; 