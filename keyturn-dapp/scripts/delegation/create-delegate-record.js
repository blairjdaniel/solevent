#!/usr/bin/env node

// Set up collection delegation for escrow PDA to verify NFTs as part of collection
// Env vars (in .env.local):
//   WALLET_SECRET_KEY_BASE58      — Base58-encoded secret key string
//   NEXT_PUBLIC_SOLANA_RPC_HOST   — RPC URL (e.g., https://api.devnet.solana.com)
//   NEXT_PUBLIC_MINT_ADDRESS      — Collection mint pubkey
//   NEXT_PUBLIC_ESCROW_PDA        — your escrow PDA pubkey

import fs from "fs";
import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity, generateSigner } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
const { mplTokenMetadata, approveCollectionAuthority, findMetadataPda, findCollectionAuthorityRecordPda } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

// Debug: Check what env vars are loaded
console.log("🔍 Debug: Checking environment variables...");
console.log("WALLET_SECRET_KEY_BASE58:", process.env.WALLET_SECRET_KEY_BASE58 ? "✅ Found" : "❌ Not found");
console.log("NEXT_PUBLIC_SOLANA_RPC_HOST:", process.env.NEXT_PUBLIC_SOLANA_RPC_HOST ? "✅ Found" : "❌ Not found");
console.log("NEXT_PUBLIC_MINT_ADDRESS:", process.env.NEXT_PUBLIC_MINT_ADDRESS ? "✅ Found" : "❌ Not found");
console.log("NEXT_PUBLIC_ESCROW_PDA:", process.env.NEXT_PUBLIC_ESCROW_PDA ? "✅ Found" : "❌ Not found");

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_MINT_ADDRESS,
  NEXT_PUBLIC_ESCROW_PDA,
} = process.env;

// Validate required vars
for (const v of [
  "WALLET_SECRET_KEY_BASE58",
  "NEXT_PUBLIC_SOLANA_RPC_HOST",
  "NEXT_PUBLIC_MINT_ADDRESS",
  "NEXT_PUBLIC_ESCROW_PDA",
]) {
  if (!process.env[v]) {
    console.error(`❌ Missing env var: ${v}`);
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
const collectionMint = publicKey(NEXT_PUBLIC_MINT_ADDRESS);
const escrowPda = publicKey(NEXT_PUBLIC_ESCROW_PDA);

(async () => {
  console.log("🔗 RPC:", NEXT_PUBLIC_SOLANA_RPC_HOST);
  console.log("👛 Collection Authority:", umiKeypair.publicKey);
  console.log("🏛️  Collection Mint:", NEXT_PUBLIC_MINT_ADDRESS);
  console.log("🤝 Escrow Delegate:", NEXT_PUBLIC_ESCROW_PDA);

  try {
    // Find PDAs
    const collectionMetadataPda = findMetadataPda(umi, { mint: collectionMint });
    const collectionAuthorityRecordPda = findCollectionAuthorityRecordPda(umi, {
      mint: collectionMint,
      collectionAuthority: escrowPda,
    });

    console.log("📄 Collection Metadata PDA:", collectionMetadataPda);
    console.log("🔐 Collection Authority Record PDA:", collectionAuthorityRecordPda);

    // Approve collection authority for escrow PDA
    console.log("\n🔐 Setting up collection delegation...");
    const { signature } = await approveCollectionAuthority(umi, {
      collectionMint: collectionMint,
      newCollectionAuthority: escrowPda,
      updateAuthority: umiKeypair.publicKey,
      collectionAuthorityRecord: collectionAuthorityRecordPda,
      payer: umiKeypair.publicKey,
    }).sendAndConfirm(umi);

    console.log("✅ Collection delegation set up successfully!");
    console.log("📝 Transaction signature:", signature);
    console.log("\n💡 Now the escrow PDA can:");
    console.log("  • Verify newly minted NFTs as part of this collection");
    console.log("  • Act on behalf of the collection during minting");
    console.log("  • Update collection metadata if needed");

  } catch (err) {
    console.error("❌ Collection delegation failed:", err);
    
    if (err.message.includes("CollectionAuthorityAlreadyExists")) {
      console.log("ℹ️  Collection authority already exists for this delegate!");
    } else {
      console.log("🔍 Error details:", err.message);
      process.exit(1);
    }
  }
})();

