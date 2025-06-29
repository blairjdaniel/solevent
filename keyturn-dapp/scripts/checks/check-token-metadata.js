#!/usr/bin/env node

// Check the metadata of a specific token to see if it's part of the collection

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
const { mplTokenMetadata, fetchMetadata, findMetadataPda, TokenStandard } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_MINT_ADDRESS,
} = process.env;

// The specific token we want to check
const TOKEN_MINT = "7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8";

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
const tokenMint = publicKey(TOKEN_MINT);
const collectionMint = publicKey(NEXT_PUBLIC_MINT_ADDRESS);

(async () => {
  console.log("🔍 Checking token metadata...");
  console.log("🪙 Token:", TOKEN_MINT);
  console.log("🏛️  Collection:", NEXT_PUBLIC_MINT_ADDRESS);

  try {
    // Find the metadata PDA for the token
    const tokenMetadataPda = findMetadataPda(umi, { mint: tokenMint });
    console.log("📄 Token Metadata PDA:", tokenMetadataPda);

    // Fetch the token metadata
    const tokenMetadata = await fetchMetadata(umi, tokenMetadataPda);
    
    console.log("\n📊 Token Metadata:");
    console.log("  Name:", tokenMetadata.name);
    console.log("  Symbol:", tokenMetadata.symbol);
    console.log("  URI:", tokenMetadata.uri);
    console.log("  Update Authority:", tokenMetadata.updateAuthority);
    console.log("  Is Mutable:", tokenMetadata.isMutable);
    console.log("  Seller Fee Basis Points:", tokenMetadata.sellerFeeBasisPoints);
    
    // Check if it's part of your collection
    const isPartOfCollection = tokenMetadata.collection && 
                              tokenMetadata.collection.key === collectionMint;
    
    console.log("\n🔗 Collection Check:");
    console.log("  Is part of your collection?", isPartOfCollection ? "✅ Yes" : "❌ No");
    
    if (tokenMetadata.collection) {
      console.log("  Collection Key:", tokenMetadata.collection.key);
      console.log("  Collection Verified:", tokenMetadata.collection.verified);
    }
    
    // Check if your wallet can update it
    const canUpdate = tokenMetadata.updateAuthority === umiKeypair.publicKey;
    console.log("\n🔐 Authority Check:");
    console.log("  Can your wallet update this token?", canUpdate ? "✅ Yes" : "❌ No");
    console.log("  Current Update Authority:", tokenMetadata.updateAuthority);
    console.log("  Your Wallet:", umiKeypair.publicKey);
    
  } catch (err) {
    console.error("❌ Failed to fetch token metadata:", err);
    console.error("This might mean the token doesn't exist or isn't an NFT");
    process.exit(1);
  }
})(); 