import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { publicKey } from '@metaplex-foundation/umi';
import { PublicKey, Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import mpl from '@metaplex-foundation/mpl-token-metadata';
import bs58 from 'bs58';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';

const { mplTokenMetadata, delegateAuthorityItemV1, findMetadataPda, findDelegateRecordPda } = mpl;

// Configuration
const REDEEM_PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID);

// Generate escrow PDA
const [escrowPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('escrow')],
  REDEEM_PROGRAM_ID
);

// Function to save webhook payload to mints folder
function saveWebhookPayload(payload, mintAddress, signature) {
  try {
    // Create mints folder if it doesn't exist
    const mintsDir = path.join(process.cwd(), 'mints');
    if (!fs.existsSync(mintsDir)) {
      fs.mkdirSync(mintsDir, { recursive: true });
      console.log('📁 Created mints folder');
    }

    // Create filename with timestamp and signature
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${signature || 'unknown'}.json`;
    const filepath = path.join(mintsDir, filename);

    // Prepare the data to save
    const dataToSave = {
      timestamp: new Date().toISOString(),
      mintAddress: mintAddress,
      signature: signature,
      webhookPayload: payload,
      extractedData: {
        mintAddress: mintAddress,
        signature: signature
      }
    };

    // Save to file
    fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2));
    console.log(`💾 Saved webhook payload to: ${filepath}`);
    
    return filepath;
  } catch (error) {
    console.error('❌ Error saving webhook payload:', error);
    return null;
  }
}

async function delegateNFTToEscrow(nftMintAddress) {
  try {
    console.log(`🔐 Delegating NFT ${nftMintAddress} to escrow PDA...`);
    
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
    const nftMint = publicKey(nftMintAddress);
    const escrowPdaUmi = publicKey(escrowPda.toString());

    console.log("👛 Current Authority:", umiKeypair.publicKey);
    console.log("🤝 Escrow Delegate:", escrowPda.toString());

    // Find PDAs
    const metadataPda = findMetadataPda(umi, { mint: nftMint });
    const delegateRecordPda = findDelegateRecordPda(umi, {
      mint: nftMint,
      delegateRole: mpl.DelegateRole.AuthorityItem,
      delegate: escrowPdaUmi,
      updateAuthority: umiKeypair.publicKey,
    });

    console.log("📄 Metadata PDA:", metadataPda);
    console.log("🔐 Delegate Record PDA:", delegateRecordPda);

    // Delegate authority to escrow PDA
    console.log("\n🔐 Setting up authority delegation...");
    const { signature } = await delegateAuthorityItemV1(umi, {
      mint: nftMint,
      authority: umiKeypair.publicKey,
      delegate: escrowPdaUmi,
      delegateRecord: delegateRecordPda,
      payer: umiKeypair.publicKey,
    }).sendAndConfirm(umi);

    console.log("✅ NFT authority delegated successfully!");
    console.log("📝 Transaction signature:", signature);
    console.log("\n💡 Now the escrow PDA can:");
    console.log("  • Update metadata on this specific NFT");
    console.log("  • Modify attributes, name, description, etc.");
    console.log("  • Control the NFT's metadata");

    return {
      success: true,
      signature: signature,
      output: `NFT authority delegated successfully! Transaction: ${signature}`
    };

  } catch (error) {
    console.error("❌ NFT delegation failed:", error);
    
    // Check if it's already delegated
    if (error.message.includes("DelegateRecordAlreadyExists") || 
        error.message.includes("already delegated")) {
      console.log("ℹ️  NFT already delegated to escrow PDA");
      return {
        success: true,
        signature: 'already_delegated',
        output: 'NFT already delegated'
      };
    }
    
    return {
      success: false,
      error: error.message,
      output: error.message
    };
  }
}

// Store processed transactions to avoid duplicates (in production, use a database)
const processedTransactions = new Set();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Received webhook notification:');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Handle different webhook payload formats
    let mintAddress = null;
    let candyMachineId = null;
    let signature = null;
    
    // Log the full structure to understand what we're getting
    console.log('🔍 Analyzing webhook payload structure...');
    
    // Check for Helius webhook format (primary)
    if (req.body.type === 'NFT_MINT') {
      console.log('🎯 Helius NFT_MINT webhook detected');
      mintAddress = req.body.account;
      candyMachineId = req.body.candyMachine;
      signature = req.body.signature;
      console.log(`📋 Mint Address: ${mintAddress}`);
      console.log(`🍬 Candy Machine: ${candyMachineId}`);
      console.log(`📝 Signature: ${signature}`);
    }
    // Check for Helius parsed data format
    else if (req.body.parsed && req.body.parsed.data) {
      console.log('🎯 Helius parsed data webhook detected');
      const parsedData = req.body.parsed.data;
      console.log('📋 Parsed data:', JSON.stringify(parsedData, null, 2));
      
      // Look for mint address in various possible locations
      mintAddress = parsedData.mint || parsedData.account || parsedData.nftMint;
      signature = req.body.signature;
      
      console.log(`📋 Extracted Mint Address: ${mintAddress}`);
      console.log(`📝 Signature: ${signature}`);
    }
    // Check for Helius account data format
    else if (req.body.accountData && req.body.accountData.length > 0) {
      console.log('🎯 Helius account data webhook detected');
      const accountData = req.body.accountData[0];
      console.log('📋 Account data:', JSON.stringify(accountData, null, 2));
      
      mintAddress = accountData.account || accountData.mint;
      signature = req.body.signature;
      
      console.log(`📋 Extracted Mint Address: ${mintAddress}`);
      console.log(`📝 Signature: ${signature}`);
    }
    // Check for Shyft webhook format (fallback)
    else if (req.body.type === 'NFT_CREATED') {
      console.log('🎯 Shyft NFT_CREATED webhook detected');
      mintAddress = req.body.account || req.body.mint || req.body.nft_address;
      candyMachineId = req.body.candy_machine || req.body.candyMachine;
      signature = req.body.signature || req.body.tx_signature;
      console.log(`📋 Mint Address: ${mintAddress}`);
      console.log(`🍬 Candy Machine: ${candyMachineId}`);
      console.log(`📝 Signature: ${signature}`);
    }
    
    // Save webhook payload to mints folder
    const savedFilePath = saveWebhookPayload(req.body, mintAddress, signature);
    
    if (!mintAddress) {
      console.log('❌ No mint address found in webhook payload');
      console.log('🔍 Available fields:', Object.keys(req.body));
      return res.status(200).json({ 
        message: 'No mint address found',
        availableFields: Object.keys(req.body),
        body: req.body,
        savedFile: savedFilePath
      });
    }
    
    // Validate the mint address format
    try {
      new PublicKey(mintAddress);
      console.log('✅ Mint address format is valid');
    } catch (error) {
      console.error('❌ Invalid mint address format:', mintAddress);
      return res.status(400).json({ 
        error: 'Invalid mint address format',
        mintAddress: mintAddress,
        savedFile: savedFilePath
      });
    }
    
    // Avoid processing duplicate transactions
    if (processedTransactions.has(signature)) {
      console.log('⏭️  Already processed this transaction, skipping...');
      return res.status(200).json({ 
        message: 'Already processed',
        savedFile: savedFilePath
      });
    }
    
    console.log(`🎯 Processing new mint: ${mintAddress}`);
    console.log(`📋 Transaction: ${signature}`);
    
    // Mark as processed
    processedTransactions.add(signature);
    
    // Delegate the newly minted NFT to escrow PDA
    const delegationResult = await delegateNFTToEscrow(mintAddress);
    console.log(`✅ Delegation result:`, delegationResult);
    
    console.log('✅ Webhook processed successfully!');
    
    res.status(200).json({
      message: 'Webhook processed successfully',
      nftAddress: mintAddress,
      delegationResult: delegationResult,
      savedFile: savedFilePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 