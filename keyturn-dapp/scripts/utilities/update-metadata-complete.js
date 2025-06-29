const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { Program, AnchorProvider } = require('@project-serum/anchor');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Pinata API credentials
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// Local Solana wallet secret key from environment
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY.split(',').map(Number);

// Program ID
const PROGRAM_ID = new PublicKey('7jj6MeXvqZtqCHkbdMUhbbQQn9FzKP8L72kzpV7x5LF');

// Instruction discriminators
const UPDATE_METADATA_DISCRIMINATOR = Buffer.from([170, 182, 43, 239, 97, 78, 225, 186]);

async function uploadMetadataToPinata(metadata) {
  console.log('📤 Uploading metadata to Pinata...');
  
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
  formData.append("file", blob, "metadata.json");

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pinata response:', response.status, errorText);
    throw new Error(`Failed to upload to Pinata: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const uri = `https://ipfs.io/ipfs/${data.IpfsHash}`;
  
  console.log('✅ Metadata uploaded to IPFS:', uri);
  return uri;
}

async function updateMetadataOnChain(mintAddress, newUri) {
  console.log('🔗 Updating metadata on-chain...');
  
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com');
  
  // Load your wallet keypair
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(Uint8Array.from(WALLET_PRIVATE_KEY))
  );
  
  const mintPubkey = new PublicKey(mintAddress);
  
  // Derive addresses
  const [escrowPda] = PublicKey.findProgramAddressSync([Buffer.from('escrow')], PROGRAM_ID);
  const escrowTokenAccount = await getAssociatedTokenAddress(mintPubkey, escrowPda, true);
  
  // Derive the Metaplex Metadata PDA for this NFT
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
      mintPubkey.toBuffer(),
    ],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  );
  
  console.log('📋 Transaction details:');
  console.log('Mint:', mintPubkey.toString());
  console.log('Escrow PDA:', escrowPda.toString());
  console.log('Escrow Token Account:', escrowTokenAccount.toString());
  console.log('Metadata PDA:', metadataPda.toString());
  console.log('New URI:', newUri);
  
  try {
    // Load the IDL
    const idl = JSON.parse(fs.readFileSync('./redeem/target/idl/redeem.json', 'utf8'));
    
    // Create provider
    const provider = new AnchorProvider(
      connection, 
      { publicKey: walletKeypair.publicKey, signTransaction: (tx) => walletKeypair.signTransaction(tx), signAllTransactions: (txs) => walletKeypair.signAllTransactions(txs) },
      { commitment: 'confirmed' }
    );
    
    // Create program instance
    const program = new Program(idl, PROGRAM_ID, provider);
    
    // Call the update_metadata instruction with correct accounts (matching IDL exactly)
    const tx = await program.methods
      .updateMetadata(newUri)
      .accounts({
        metadata: metadataPda,
        escrowNftAccount: escrowTokenAccount,
        escrowPda: escrowPda,
        mint: mintPubkey,
        update_authority: walletKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      })
      .rpc();
    
    console.log('✅ Metadata updated on-chain successfully!');
    console.log('Transaction signature:', tx);
    
    return tx;
    
  } catch (error) {
    console.error('❌ Error updating metadata on-chain:', error);
    throw error;
  }
}

async function updateMetadataComplete(mintAddress, originalMetadata) {
  try {
    console.log('🚀 Starting complete metadata update process...');
    console.log('Mint address:', mintAddress);
    
    // 1. Create updated metadata
    const updatedMetadata = {
      ...originalMetadata,
      attributes: originalMetadata.attributes?.map(attr => 
        attr.trait_type === "Status" 
          ? { ...attr, value: "Redeemed" }
          : attr
      ) || [],
      description: "This NFT has been redeemed and updated while in escrow.",
    };
    
    console.log('📝 Updated metadata:', JSON.stringify(updatedMetadata, null, 2));
    
    // 2. Upload to Pinata/IPFS
    const newUri = await uploadMetadataToPinata(updatedMetadata);
    
    // 3. Update on-chain metadata via Anchor program
    const txSignature = await updateMetadataOnChain(mintAddress, newUri);
    
    console.log('🎉 Complete metadata update successful!');
    console.log('IPFS URI:', newUri);
    console.log('Transaction:', txSignature);
    
    return { uri: newUri, signature: txSignature };
    
  } catch (error) {
    console.error('❌ Complete metadata update failed:', error);
    throw error;
  }
}

// Example usage
async function main() {
  // Example NFT mint address (replace with actual)
  const mintAddress = "kn2Xdc5hwLtSg21S2rXv3yPT3czXLurgkmYPdoAxt9p";
  
  // Example original metadata (use the actual metadata from your NFT)
  const originalMetadata = {
    name: "Burrow Born",
    symbol: "BB",
    description: "Tradeable Burrow Born NFT for a Physical Burrow Born Graphic Novel.",
    image: "https://gateway.pinata.cloud/ipfs/QmdSWTEPKudZGHm6xWcSNts37aLZgPPKxnzR5iHCkLxDdK/0.png",
    external_url: "https://hoodsdao.xyz",
    attributes: [
      { trait_type: "Edition", value: "Open" },
      { trait_type: "Type", value: "Burrow Born" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Status", value: "Tradeable" }
    ],
    properties: {
      files: [{ uri: "https://gateway.pinata.cloud/ipfs/QmdSWTEPKudZGHm6xWcSNts37aLZgPPKxnzR5iHCkLxDdK/0.png", type: "image/png" }],
      category: "image"
    }
  };
  
  await updateMetadataComplete(mintAddress, originalMetadata);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateMetadataComplete, uploadMetadataToPinata, updateMetadataOnChain }; 