const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

// Configuration
const PROGRAM_ID = new PublicKey('7jj6MeXvqZtqCHkbdMUhbbQQn9FzKP8L72kzpV7x5LF');
const MINT_ADDRESS = '5uaU3xWUEfqcSKkVgJvTzm66SodGMCA4h9VWKa91L2nV';
const KEYPAIR_PATH = process.env.KEYPAIR_PATH || '/Users/blairjdaniel/.config/solana/id.json';

async function checkBalances() {
  try {
    const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'))));
    const connection = new Connection(clusterApiUrl('devnet'));
    
    // Derive addresses
    const [escrowPda] = PublicKey.findProgramAddressSync([Buffer.from('escrow')], PROGRAM_ID);
    const mintPubkey = new PublicKey(MINT_ADDRESS);
    const userTokenAccount = await getAssociatedTokenAddress(mintPubkey, payer.publicKey);
    const escrowTokenAccount = await getAssociatedTokenAddress(mintPubkey, escrowPda, true);
    
    console.log('💰 Current Token Balances:');
    console.log('  User Token Account:', userTokenAccount.toBase58());
    console.log('  Escrow Token Account:', escrowTokenAccount.toBase58());
    
    try {
      const userBalance = await connection.getTokenAccountBalance(userTokenAccount);
      console.log('  User balance:', userBalance.value.amount);
    } catch (error) {
      console.log('  User balance: Account not found or error');
    }
    
    try {
      const escrowBalance = await connection.getTokenAccountBalance(escrowTokenAccount);
      console.log('  Escrow balance:', escrowBalance.value.amount);
    } catch (error) {
      console.log('  Escrow balance: Account not found or error');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBalances(); 