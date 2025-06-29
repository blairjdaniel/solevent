#!/usr/bin/env node

// Check if the Candy Machine has the proper collection delegate set up

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
import { fetchCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
const { mplTokenMetadata, fetchMetadata, findMetadataPda, TokenStandard } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_CANDY_MACHINE_ID,
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
const candyMachineId = publicKey(NEXT_PUBLIC_CANDY_MACHINE_ID);
const collectionMint = publicKey(NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);

(async () => {
  console.log("🔍 Checking Candy Machine collection delegate...");
  console.log("🍬 Candy Machine:", NEXT_PUBLIC_CANDY_MACHINE_ID);
  console.log("🏛️  Collection:", NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);

  try {
    // Fetch Candy Machine
    const candyMachine = await fetchCandyMachine(umi, candyMachineId);
    console.log("\n📊 Candy Machine Info:");
    console.log("  Authority:", candyMachine.authority);
    console.log("  Collection Mint:", candyMachine.collectionMint);
    console.log("  Collection Update Authority:", candyMachine.collectionUpdateAuthority);
    
    // Check if collection mint matches
    const collectionMatches = candyMachine.collectionMint === collectionMint;
    console.log("  Collection matches config?", collectionMatches ? "✅ Yes" : "❌ No");
    
    // Check collection metadata
    const collectionMetadataPda = findMetadataPda(umi, { mint: collectionMint });
    const collectionMetadata = await fetchMetadata(umi, collectionMetadataPda);
    
    console.log("\n📄 Collection Metadata:");
    console.log("  Name:", collectionMetadata.name);
    console.log("  Update Authority:", collectionMetadata.updateAuthority);
    console.log("  Is Mutable:", collectionMetadata.isMutable);
    
    // Check if your wallet is the collection update authority
    const isCollectionAuthority = collectionMetadata.updateAuthority === umiKeypair.publicKey;
    console.log("\n🔐 Collection Authority Check:");
    console.log("  Is your wallet the collection update authority?", isCollectionAuthority ? "✅ Yes" : "❌ No");
    
    if (!isCollectionAuthority) {
      console.log("  Collection Update Authority:", collectionMetadata.updateAuthority);
      console.log("  Your Wallet:", umiKeypair.publicKey);
    }
    
  } catch (err) {
    console.error("❌ Failed to check Candy Machine:", err);
    process.exit(1);
  }
})(); 