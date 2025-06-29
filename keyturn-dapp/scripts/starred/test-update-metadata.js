#!/usr/bin/env node

// Test updating metadata using escrow PDA as delegate
// This script tests if the delegation worked by updating isMutable to false

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl, { updateV1 } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair, PublicKey } from "@solana/web3.js";
const { mplTokenMetadata, updateMetadata, TokenStandard } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
} = process.env;

// Validate required vars
for (const v of [
  "WALLET_SECRET_KEY_BASE58",
  "NEXT_PUBLIC_SOLANA_RPC_HOST",
]) {
  if (!process.env[v]) {
    console.error(`❌ Missing env var: ${v}`);
    process.exit(1);
  }
}

// Configuration
const REDEEM_PROGRAM_ID = new PublicKey('5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7');

// Generate escrow PDA
const [escrowPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('escrow')],
  REDEEM_PROGRAM_ID
);

// Use the newly minted NFT address
const NFT_MINT_ADDRESS = "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT";

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
const mintPk = publicKey(NFT_MINT_ADDRESS);
const escrowPdaUmi = publicKey(escrowPda.toString());

(async () => {
  console.log("🔗 RPC:", NEXT_PUBLIC_SOLANA_RPC_HOST);
  console.log("👛 Wallet Authority:", umiKeypair.publicKey);
  console.log("🪙 NFT Mint Address:", NFT_MINT_ADDRESS);
  console.log("🤝 Escrow PDA (Delegate):", escrowPda.toString());
  console.log("📝 Action: Setting isMutable to false");

  try {
    const { signature } = await updateV1(umi, {
      mint: mintPk,
      authority: umiKeypair.publicKey,
      delegate: escrowPdaUmi,
      isMutable: false,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);

    console.log("✅ Metadata updated successfully!");
    console.log("📄 Transaction signature:", signature);
    console.log("🔒 isMutable is now set to: false");
    
    // Convert signature to base58 for easier viewing
    const signatureBase58 = bs58.encode(signature);
    console.log("🔗 View on Solscan:", `https://solscan.io/tx/${signatureBase58}?cluster=devnet`);
    
  } catch (err) {
    console.error("❌ Failed to update metadata:", err);
    process.exit(1);
  }
})();
  