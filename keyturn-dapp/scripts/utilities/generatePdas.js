const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

// === CONFIGURATION ===
// Path to your keypair file (update if needed)
const KEYPAIR_PATH = process.env.KEYPAIR_PATH || '/Users/blairjdaniel/.config/solana/id.json';
// Your program ID and mint address (update as needed)
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || '7jj6MeXvqZtqCHkbdmMUhbbQQn9FzKP8L72kzpV7x5LF');
const MINT = new PublicKey(process.env.MINT_ADDRESS); // Set this in your .env

// === SCRIPT ===
const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'))));
const connection = new Connection(clusterApiUrl(process.env.SOLANA_CLUSTER || 'devnet'));

(async () => {
  // Derive the escrow PDA
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow')],
    PROGRAM_ID
  );

  // Create or fetch the ATA for the PDA
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,         // payer
    MINT,          // mint
    escrowPda,     // owner (PDA)
    true           // allowOwnerOffCurve
  );

  console.log('Escrow PDA:', escrowPda.toBase58());
  console.log('Escrow ATA:', ata.address.toBase58());
})();
