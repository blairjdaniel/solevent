#!/usr/bin/env node

// Delegate authority for a specific NFT to escrow PDA
// Usage: 
//   node scripts/delegate-specific-nft.js                    # Uses latest mint from mints folder
//   node scripts/delegate-specific-nft.js <NFT_MINT_ADDRESS> # Uses specific address
// This will be called by the webhook with the newly minted NFT address

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import { updateAsAuthorityItemDelegateV2 } from "@metaplex-foundation/mpl-token-metadata";
const { mplTokenMetadata, delegateAuthorityItemV1, findMetadataPda, findDelegateRecordPda } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_ESCROW_PDA,
} = process.env;

// Function to get the latest mint from mints folder
function getLatestMintFromFolder() {
  try {
    const mintsDir = path.join(process.cwd(), 'mints');
    
    if (!fs.existsSync(mintsDir)) {
      console.log('📁 Mints folder does not exist yet');
      return null;
    }
    
    // Get all JSON files in the mints folder
    const files = fs.readdirSync(mintsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(mintsDir, file),
        time: fs.statSync(path.join(mintsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first
    
    if (files.length === 0) {
      console.log('📁 No mint files found in mints folder');
      return null;
    }
    
    // Read the latest file
    const latestFile = files[0];
    console.log(`📄 Reading latest mint file: ${latestFile.name}`);
    
    const fileContent = fs.readFileSync(latestFile.path, 'utf8');
    const mintData = JSON.parse(fileContent);
    
    if (!mintData.mintAddress) {
      console.log('❌ No mint address found in the latest file');
      return null;
    }
    
    console.log(`🎯 Found mint address: ${mintData.mintAddress}`);
    console.log(`📝 Transaction signature: ${mintData.signature}`);
    
    return mintData.mintAddress;
    
  } catch (error) {
    console.error('❌ Error reading from mints folder:', error);
    return null;
  }
}

// Parse command line args for --immutable flag
const makeImmutable = process.argv.includes('--immutable');

// Get NFT mint address from command line argument or latest mint file
let nftMintAddress = process.argv[2];

if (!nftMintAddress) {
  console.log('🔍 No mint address provided, checking mints folder for latest...');
  nftMintAddress = getLatestMintFromFolder();
  
  if (!nftMintAddress) {
    console.error("❌ No mint address found!");
    console.error("Usage: node scripts/delegate-specific-nft.js [NFT_MINT_ADDRESS]");
    console.error("Or ensure there are JSON files in the mints/ folder");
    process.exit(1);
  }
}

// Decode base58 secret key and create UMI keypair
let umiKeypair;
try {
  const secretKey = bs58.decode(WALLET_SECRET_KEY_BASE58);
  const web3JsKeypair = Keypair.fromSecretKey(secretKey);
  umiKeypair = fromWeb3JsKeypair(web3JsKeypair);
} catch (err) {
  console.error("❌ Failed to decode WALLET_SECRET_KEY_BASE58:", err.message);
  process.exit(1);
}

// Create UMI instance with wallet identity
const umi = createUmi(NEXT_PUBLIC_SOLANA_RPC_HOST)
  .use(mplTokenMetadata())
  .use(keypairIdentity(umiKeypair));

// Prepare pubkeys using UMI publicKey function
const nftMint = publicKey(nftMintAddress);
const escrowPda = publicKey(NEXT_PUBLIC_ESCROW_PDA);

(async () => {
  console.log("🔍 Delegating NFT authority to escrow PDA...");
  console.log("🪙 NFT Mint:", nftMintAddress);
  console.log("👛 Current Authority:", umiKeypair.publicKey);
  console.log("🤝 Escrow Delegate:", NEXT_PUBLIC_ESCROW_PDA);

  try {
    // Find PDAs
    const metadataPda = findMetadataPda(umi, { mint: nftMint });
    const delegateRecordPda = findDelegateRecordPda(umi, {
      mint: nftMint,
      delegateRole: 0,
      delegate: escrowPda,
      updateAuthority: umiKeypair.publicKey,
    });

    console.log("📄 Metadata PDA:", metadataPda);
    console.log("🔐 Delegate Record PDA:", delegateRecordPda);

    // Delegate authority to escrow PDA
    console.log("\n🔐 Setting up authority delegation...");
    const { signature } = await delegateAuthorityItemV1(umi, {
      mint: nftMint,
      authority: umiKeypair.publicKey,
      delegate: escrowPda,
      delegateRecord: delegateRecordPda,
      payer: umiKeypair.publicKey,
    }).sendAndConfirm(umi);

    console.log("✅ NFT authority delegated successfully!");
    console.log("📝 Transaction signature:", signature);

    // If --immutable flag is set, update NFT to immutable using the escrow PDA
    if (makeImmutable) {
      console.log("\n🔒 Updating NFT to immutable using escrow PDA as delegate...");
      await updateAsAuthorityItemDelegateV2(umi, {
        mint: nftMint,
        authority: escrowPda,
        newUpdateAuthority: escrowPda,
        isMutable: false,
      }).sendAndConfirm(umi);
      console.log("✅ NFT is now immutable!");
    }

    console.log("\n💡 Now the escrow PDA can:");
    console.log("  • Update metadata on this specific NFT");
    console.log("  • Modify attributes, name, description, etc.");
    console.log("  • Control the NFT's metadata");

    // Return success for webhook integration
    process.exit(0);

  } catch (err) {
    console.error("❌ NFT delegation failed:", err);
    
    if (err.message && err.message.includes("DelegateRecordAlreadyExists")) {
      console.log("ℹ️  Authority already delegated for this NFT!");
      // Optionally, try to update to immutable if --immutable is set
      if (makeImmutable) {
        try {
          console.log("\n🔒 Updating NFT to immutable using escrow PDA as delegate...");
          await updateAsAuthorityItemDelegateV2(umi, {
            mint: nftMint,
            authority: escrowPda,
            newUpdateAuthority: escrowPda,
            isMutable: false,
          }).sendAndConfirm(umi);
          console.log("✅ NFT is now immutable!");
        } catch (updateErr) {
          console.error("❌ Failed to update NFT to immutable:", updateErr);
        }
      }
      process.exit(0);
    } else {
      console.log("🔍 Error details:", err.message);
      process.exit(1);
    }
  }
})(); 