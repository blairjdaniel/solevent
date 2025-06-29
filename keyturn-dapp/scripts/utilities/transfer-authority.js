import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7');
const ESCROW_PDA = new PublicKey('2ANVeQAjk3XyQpXvgzPH99AvPv2aUX6cCJWd5BQ2FACy');

// Load the IDL
const idlPath = join(__dirname, 'target', 'idl', 'redeem.json');
const idl = JSON.parse(readFileSync(idlPath, 'utf8'));

// Setup connection and provider
const connection = new Connection(RPC_URL, 'confirmed');
const keypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(readFileSync('/Users/blairjdaniel/.config/solana/id.json', 'utf8')))
);

const wallet = {
  publicKey: keypair.publicKey,
  signTransaction: (tx) => {
    tx.sign(keypair);
    return Promise.resolve(tx);
  },
  signAllTransactions: (txs) => {
    txs.forEach(tx => tx.sign(keypair));
    return Promise.resolve(txs);
  }
};

const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, PROGRAM_ID, provider);

// Function to transfer update authority
async function transferUpdateAuthority(nftMintAddress) {
  try {
    console.log('🔧 Transferring update authority...');
    console.log('NFT Mint:', nftMintAddress);
    console.log('Escrow PDA:', ESCROW_PDA.toString());

    // Derive metadata account
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        new PublicKey(nftMintAddress).toBuffer(),
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    );

    console.log('Metadata Account:', metadataAccount.toString());

    // Call the transfer_update_authority instruction
    const tx = await program.methods
      .transferUpdateAuthority({})
      .accounts({
        user: keypair.publicKey,
        escrowPda: ESCROW_PDA,
        metadata: metadataAccount,
        tokenMetadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      })
      .rpc();

    console.log('✅ Update authority transferred successfully!');
    console.log('Transaction signature:', tx);
    
    return tx;
  } catch (error) {
    console.error('❌ Error transferring update authority:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const nftMintAddress = process.argv[2];
  
  if (!nftMintAddress) {
    console.log('Usage: node transfer-authority.js <NFT_MINT_ADDRESS>');
    console.log('Example: node transfer-authority.js 5qcCqmHA4agUkeTdwKe8hNngZdx8R3TfHYPWHhRZsd55');
    return;
  }

  await transferUpdateAuthority(nftMintAddress);
}

main().catch(console.error); 