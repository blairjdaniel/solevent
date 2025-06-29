#!/usr/bin/env node

// Check NFT type and structure to understand the correct approach

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
const { mplTokenMetadata, fetchMetadata, findMetadataPda, findMasterEditionPda, fetchMasterEdition } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_COLLECTION_MINT_ADDRESS,
} = process.env;

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
const collectionMint = publicKey(NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);

(async () => {
  console.log("🔍 Analyzing NFT Type and Structure...");
  console.log("🏛️  NFT Mint:", NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);

  try {
    // Check metadata
    const metadataPda = findMetadataPda(umi, { mint: collectionMint });
    const metadata = await fetchMetadata(umi, metadataPda);
    
    console.log("\n📄 Metadata Analysis:");
    console.log("  Name:", metadata.name);
    console.log("  Symbol:", metadata.symbol);
    console.log("  URI:", metadata.uri);
    console.log("  Update Authority:", metadata.updateAuthority);
    console.log("  Is Mutable:", metadata.isMutable);
    console.log("  Seller Fee Basis Points:", metadata.sellerFeeBasisPoints);
    console.log("  Collection:", metadata.collection);
    console.log("  Uses:", metadata.uses);
    console.log("  Token Standard:", metadata.tokenStandard);
    
    // Check if it has a master edition
    console.log("\n👑 Master Edition Analysis:");
    try {
      const masterEditionPda = findMasterEditionPda(umi, { mint: collectionMint });
      const masterEdition = await fetchMasterEdition(umi, masterEditionPda);
      console.log("  Has Master Edition: ✅ Yes");
      console.log("  Supply:", masterEdition.supply);
      console.log("  Max Supply:", masterEdition.maxSupply);
      console.log("  Is Collection: ✅ Yes (has master edition)");
    } catch (err) {
      console.log("  Has Master Edition: ❌ No");
      console.log("  Is Collection: ❌ No (no master edition)");
      console.log("  Error:", err.message);
    }
    
    // Determine NFT type
    console.log("\n🏷️  NFT Type Determination:");
    if (metadata.collection) {
      console.log("  Has Collection Reference: ✅ Yes");
      console.log("  Collection Key:", metadata.collection.key);
      console.log("  Collection Verified:", metadata.collection.verified);
    } else {
      console.log("  Has Collection Reference: ❌ No");
    }
    
    // Check if this is meant to be a collection NFT
    if (metadata.name === "Burrow Born" && !metadata.collection) {
      console.log("  This appears to be a Collection NFT (no collection reference)");
      console.log("  Collection NFTs don't need to be verified as part of themselves");
    } else if (metadata.collection) {
      console.log("  This appears to be a regular NFT that should be part of a collection");
    }
    
    console.log("\n💡 Recommendations:");
    if (metadata.name === "Burrow Born" && !metadata.collection) {
      console.log("  • This is your collection NFT - no verification needed");
      console.log("  • You can proceed directly to setting up delegation");
      console.log("  • The 'Incorrect account owner' error was because we tried to verify a collection as itself");
    } else {
      console.log("  • This NFT needs to be added to a collection first");
      console.log("  • Then verify it as part of that collection");
    }
    
  } catch (err) {
    console.error("❌ Failed to analyze NFT:", err);
    process.exit(1);
  }
})(); 