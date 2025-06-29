#!/usr/bin/env node

// Check the current metadata state of the collection NFT

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
  NEXT_PUBLIC_ESCROW_PDA,
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
const mintPk = publicKey(NEXT_PUBLIC_MINT_ADDRESS);

(async () => {
  console.log("🔍 Checking collection metadata...");
  console.log("🪙 Collection NFT:", NEXT_PUBLIC_MINT_ADDRESS);
  console.log("👛 Your Wallet:", umiKeypair.publicKey);

  try {
    // Find the metadata PDA
    const metadataPda = findMetadataPda(umi, { mint: mintPk });
    console.log("📄 Metadata PDA:", metadataPda);

    // Fetch the metadata
    const metadata = await fetchMetadata(umi, metadataPda);
    
    console.log("\n📊 Current Metadata State:");
    console.log("  Update Authority:", metadata.updateAuthority);
    console.log("  Is Mutable:", metadata.isMutable);
    console.log("  Data URI:", metadata.uri);
    console.log("  Name:", metadata.name);
    console.log("  Symbol:", metadata.symbol);
    console.log("  Seller Fee Basis Points:", metadata.sellerFeeBasisPoints);
    
    // Check if your wallet is the update authority
    const isYourWallet = metadata.updateAuthority === umiKeypair.publicKey;
    console.log("\n🔐 Authority Check:");
    console.log("  Is your wallet the update authority?", isYourWallet ? "✅ Yes" : "❌ No");
    
    if (!isYourWallet) {
      console.log("  Current Update Authority:", metadata.updateAuthority);
      console.log("  Your Wallet:", umiKeypair.publicKey);
    }
    
  } catch (err) {
    console.error("❌ Failed to fetch metadata:", err);
    process.exit(1);
  }
})(); 