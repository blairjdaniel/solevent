#!/usr/bin/env node

// Debug collection setup and ownership issues

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
import { fetchCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
const { mplTokenMetadata, fetchMetadata, findMetadataPda, findMasterEditionPda, fetchMasterEdition } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_CANDY_MACHINE_ID,
  NEXT_PUBLIC_COLLECTION_MINT_ADDRESS,
  NEXT_PUBLIC_ESCROW_PDA,
  NEXT_PUBLIC_MINT_ADDRESS,
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
const nftMint = publicKey(NEXT_PUBLIC_MINT_ADDRESS);
const escrowPda = publicKey(NEXT_PUBLIC_ESCROW_PDA);

(async () => {
  console.log("🔍 Debug: Collection and NFT Ownership Analysis");
  console.log("👛 Your Wallet:", umiKeypair.publicKey);
  console.log("🏛️  Collection:", NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);
  console.log("🪙 NFT Mint:", NEXT_PUBLIC_MINT_ADDRESS);
  console.log("🤝 Escrow PDA:", NEXT_PUBLIC_ESCROW_PDA);

  try {
    // 1. Check Collection NFT ownership and metadata
    console.log("\n📊 1. Collection NFT Analysis:");
    const collectionMetadataPda = findMetadataPda(umi, { mint: collectionMint });
    const collectionMetadata = await fetchMetadata(umi, collectionMetadataPda);
    console.log("  Collection Name:", collectionMetadata.name);
    console.log("  Collection Update Authority:", collectionMetadata.updateAuthority);
    console.log("  Is your wallet the collection authority?", collectionMetadata.updateAuthority === umiKeypair.publicKey ? "✅ Yes" : "❌ No");
    
    // 2. Check individual NFT ownership and metadata
    console.log("\n🪙 2. Individual NFT Analysis:");
    const nftMetadataPda = findMetadataPda(umi, { mint: nftMint });
    const nftMetadata = await fetchMetadata(umi, nftMetadataPda);
    console.log("  NFT Name:", nftMetadata.name);
    console.log("  NFT Update Authority:", nftMetadata.updateAuthority);
    console.log("  Is your wallet the NFT authority?", nftMetadata.updateAuthority === umiKeypair.publicKey ? "✅ Yes" : "❌ No");
    
    // 3. Check Candy Machine collection settings
    console.log("\n🍬 3. Candy Machine Collection Settings:");
    const candyMachine = await fetchCandyMachine(umi, candyMachineId);
    console.log("  Candy Machine Collection Mint:", candyMachine.collectionMint);
    console.log("  Candy Machine Authority:", candyMachine.authority);
    console.log("  Collection matches?", candyMachine.collectionMint === collectionMint ? "✅ Yes" : "❌ No");
    
    // 4. Check if NFT is part of the collection
    console.log("\n🔗 4. Collection Membership:");
    const isInCollection = nftMetadata.collection?.key === collectionMint;
    console.log("  Is NFT part of collection?", isInCollection ? "✅ Yes" : "❌ No");
    console.log("  Collection verification status:", nftMetadata.collection?.verified ? "✅ Verified" : "❌ Not Verified");
    
    // 5. Authority analysis
    console.log("\n🔐 5. Authority Analysis:");
    const canUpdateCollection = collectionMetadata.updateAuthority === umiKeypair.publicKey;
    const canUpdateNft = nftMetadata.updateAuthority === umiKeypair.publicKey;
    const isCandyMachineAuthority = candyMachine.authority === umiKeypair.publicKey;
    
    console.log("  Can update collection metadata:", canUpdateCollection ? "✅ Yes" : "❌ No");
    console.log("  Can update NFT metadata:", canUpdateNft ? "✅ Yes" : "❌ No");
    console.log("  Is candy machine authority:", isCandyMachineAuthority ? "✅ Yes" : "❌ No");
    
    // 6. Identify the issue
    console.log("\n⚠️  6. Issue Analysis:");
    if (!canUpdateNft) {
      console.log("  ❌ MAIN ISSUE: You cannot update NFT metadata - you're not the update authority");
      console.log("     This is why you're getting 'Incorrect account owner' error");
    }
    if (!canUpdateCollection) {
      console.log("  ❌ You cannot update collection metadata - you're not the collection authority");
    }
    if (!isInCollection) {
      console.log("  ❌ NFT is not part of the collection");
    }
    if (!nftMetadata.collection?.verified) {
      console.log("  ❌ Collection is not verified on the NFT");
    }
    
    // 7. Recommendations
    console.log("\n💡 7. Recommendations:");
    if (!canUpdateNft) {
      console.log("  • You need to be the NFT's update authority to set delegation");
      console.log("  • Check if you own this NFT or if it was minted to a different wallet");
      console.log("  • If you own the NFT, check if update authority was transferred");
    }
    if (!canUpdateCollection) {
      console.log("  • You need collection authority to verify NFTs as part of collection");
    }
    if (!isInCollection) {
      console.log("  • NFT needs to be added to collection first");
    }
    
  } catch (err) {
    console.error("❌ Failed to analyze collection setup:", err);
    process.exit(1);
  }
})(); 