import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { publicKey } from '@metaplex-foundation/umi';
import { PublicKey, Keypair } from '@solana/web3.js';
import mpl, { updateV1 } from '@metaplex-foundation/mpl-token-metadata';
import bs58 from 'bs58';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';

const { mplTokenMetadata, TokenStandard } = mpl;

// Configuration
const REDEEM_PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID);

// Generate escrow PDA
const [escrowPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('escrow')],
  REDEEM_PROGRAM_ID
);

async function updateMetadataToImmutable(nftMintAddress) {
  try {
    console.log(`🔄 Updating metadata to immutable for NFT: ${nftMintAddress}`);
    
    // Decode base58 secret key and create UMI keypair
    let umiKeypair;
    try {
      const secretKey = bs58.decode(process.env.WALLET_SECRET_KEY_BASE58);
      const web3JsKeypair = Keypair.fromSecretKey(secretKey);
      umiKeypair = fromWeb3JsKeypair(web3JsKeypair);
    } catch (err) {
      console.error("❌ Failed to decode WALLET_SECRET_KEY_BASE58:", err.message);
      throw err;
    }

    // Create UMI instance with wallet identity
    const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST)
      .use(mplTokenMetadata())
      .use(keypairIdentity(umiKeypair));

    // Prepare pubkeys using UMI publicKey function
    const mintPk = publicKey(nftMintAddress);
    const escrowPdaUmi = publicKey(escrowPda.toString());

    console.log("👛 Wallet Authority:", umiKeypair.publicKey);
    console.log("🤝 Escrow PDA (Delegate):", escrowPda.toString());
    console.log("📝 Action: Setting isMutable to false");

    // Update metadata using escrow PDA as delegate
    const { signature } = await updateV1(umi, {
      mint: mintPk,
      authority: umiKeypair.publicKey,
      delegate: escrowPdaUmi,
      isMutable: false,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);

    console.log("✅ Metadata updated to immutable successfully!");
    console.log("📄 Transaction signature:", signature);
    console.log("🔒 isMutable is now set to: false");
    
    // Convert signature to base58 for easier viewing
    const signatureBase58 = bs58.encode(signature);
    console.log("🔗 View on Solscan:", `https://solscan.io/tx/${signatureBase58}?cluster=devnet`);

    return {
      success: true,
      signature: signatureBase58,
      output: `Metadata updated to immutable successfully! Transaction: ${signatureBase58}`
    };

  } catch (error) {
    console.error("❌ Metadata update failed:", error);
    
    return {
      success: false,
      error: error.message,
      output: error.message
    };
  }
}

// Store processed deposits to avoid duplicates
const processedDeposits = new Set();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Received deposit webhook notification:');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Extract deposit information
    let nftMintAddress = null;
    let ownerAddress = null;
    let signature = null;
    
    // Handle different webhook payload formats
    if (req.body.type === 'NFT_DEPOSIT') {
      console.log('🎯 NFT_DEPOSIT webhook detected');
      nftMintAddress = req.body.nftMint;
      ownerAddress = req.body.owner;
      signature = req.body.signature;
    } else if (req.body.nftMint && req.body.owner) {
      console.log('🎯 Direct deposit data detected');
      nftMintAddress = req.body.nftMint;
      ownerAddress = req.body.owner;
      signature = req.body.signature || req.body.txSignature;
    } else {
      console.log('❌ No valid deposit data found in webhook payload');
      return res.status(400).json({ 
        error: 'Invalid deposit data',
        required: ['nftMint', 'owner'],
        received: req.body
      });
    }
    
    console.log(`📋 NFT Mint Address: ${nftMintAddress}`);
    console.log(`👤 Owner Address: ${ownerAddress}`);
    console.log(`📝 Transaction Signature: ${signature}`);
    
    // Validate the mint address format
    try {
      new PublicKey(nftMintAddress);
      console.log('✅ Mint address format is valid');
    } catch (error) {
      console.error('❌ Invalid mint address format:', nftMintAddress);
      return res.status(400).json({ 
        error: 'Invalid mint address format',
        mintAddress: nftMintAddress
      });
    }
    
    // Avoid processing duplicate deposits
    if (processedDeposits.has(signature)) {
      console.log('⏭️  Already processed this deposit, skipping...');
      return res.status(200).json({ 
        message: 'Already processed'
      });
    }
    
    console.log(`🎯 Processing deposit for NFT: ${nftMintAddress}`);
    console.log(`👤 Owner: ${ownerAddress}`);
    
    // Mark as processed
    processedDeposits.add(signature);
    
    // Update metadata to immutable using the working JavaScript approach
    console.log('\n🔄 Updating metadata to immutable...');
    const metadataResult = await updateMetadataToImmutable(nftMintAddress);
    console.log(`✅ Metadata update result:`, metadataResult);
    
    console.log('✅ Deposit webhook processed successfully!');
    console.log('📝 NFT is now immutable and ready for return');
    
    res.status(200).json({
      message: 'Deposit webhook processed successfully',
      nftAddress: nftMintAddress,
      ownerAddress: ownerAddress,
      metadataResult: metadataResult,
      note: 'NFT is now immutable and ready for return',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error processing deposit webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 