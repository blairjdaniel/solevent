const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { findMetadataPda } = require('@metaplex-foundation/js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Configuration
const MINT_ADDRESS = process.env.TEST_NFT_MINT || 'kn2Xdc5hwLtSg21S2rXv3yPT3czXLurgkmYPdoAxt9p';
const NEW_IPFS_HASH = process.env.NEW_IPFS_HASH || 'QmfHrLGrDQZRyUk5a1RoP4s5MTZwk4ceZPsTeVZ8GLPFLT';
const NEW_URI = `https://ipfs.io/ipfs/${NEW_IPFS_HASH}`;

// Load your wallet from environment or fallback to local file
let walletKeypair;
if (process.env.WALLET_PRIVATE_KEY) {
  const privateKey = process.env.WALLET_PRIVATE_KEY.split(',').map(Number);
  walletKeypair = Keypair.fromSecretKey(Buffer.from(Uint8Array.from(privateKey)));
} else {
  walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('/Users/blairjdaniel/.config/solana/id.json', 'utf8')))
  );
}

const connection = new Connection(process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');

async function updateMetadataURI() {
  try {
    console.log('🔗 Updating on-chain metadata URI...');
    console.log('Mint:', MINT_ADDRESS);
    console.log('New URI:', NEW_URI);

    const mintPubkey = new PublicKey(MINT_ADDRESS);
    const metadataPda = findMetadataPda(mintPubkey);

    // Create the Metaplex UpdateV1 instruction
    const uriLengthBuffer = Buffer.alloc(4);
    uriLengthBuffer.writeUInt32LE(NEW_URI.length, 0);
    
    const instructionData = Buffer.concat([
      Buffer.from([2, 0, 0, 0]), // UpdateV1 discriminator
      Buffer.from([1]), // Option::Some for data
      // DataV2 structure
      Buffer.alloc(4), // name length (0)
      Buffer.alloc(4), // symbol length (0)
      uriLengthBuffer, // uri length
      Buffer.from(NEW_URI), // uri
      Buffer.alloc(2), // seller_fee_basis_points (u16, 0 for now)
      Buffer.from([0]), // Option::None for creators
      Buffer.from([0]), // Option::None for collection
      Buffer.from([0]), // Option::None for uses
      Buffer.from([0]), // Option::None for update_authority
      Buffer.from([0]), // Option::None for primary_sale_happened
      Buffer.from([0]), // Option::None for is_mutable
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: metadataPda, isSigner: false, isWritable: true },
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
      data: instructionData,
    });

    const transaction = new Transaction().add(instruction);
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletKeypair.publicKey;
    
    transaction.sign(walletKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('✅ Metadata URI updated successfully!');
    console.log('Transaction signature:', signature);
    
  } catch (error) {
    console.error('❌ Error updating metadata URI:', error);
  }
}

updateMetadataURI(); 