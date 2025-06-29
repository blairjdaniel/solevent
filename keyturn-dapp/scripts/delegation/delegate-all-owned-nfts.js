#!/usr/bin/env node

// Delegate authority for all owned NFTs to redeem PDA
// This script will find all NFTs you own and delegate them

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
const { mplTokenMetadata, delegateAuthorityItemV1, findMetadataPda, findDelegateRecordPda, DelegateRole } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_ESCROW_PDA,
} = process.env;

// Validate required vars
for (const v of [
  "WALLET_SECRET_KEY_BASE58",
  "NEXT_PUBLIC_SOLANA_RPC_HOST",
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

// Create web3.js connection for token account queries
const connection = new Connection(NEXT_PUBLIC_SOLANA_RPC_HOST, 'confirmed');

// Prepare pubkeys
const escrowPda = publicKey(NEXT_PUBLIC_ESCROW_PDA);

// Your wallet address
const WALLET_ADDRESS = "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC";

// List of tokens to process
const TOKENS_TO_PROCESS = [
  "BH5cJCqFhK3K5pZqwqrHCNsQocNS2cgjbdXyDYuEDL33",
  "2nMwwJCW7Fbx2V98aZBc1FeGY2hGZpGKGZB1coyoBRAt",
  "7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8",
  "DaRFnTaDSTnGHKwQhEKcoBnHBYbGZ34KWTPKmgw1f2Rp"
];

async function getAllOwnedNfts() {
  console.log("🔍 Finding all owned NFTs...");
  console.log("👛 Wallet:", WALLET_ADDRESS);

  try {
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(WALLET_ADDRESS),
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );

    const ownedNfts = [];
    
    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      const balance = parseInt(tokenInfo.tokenAmount.amount);
      const mintAddress = tokenInfo.mint;
      
      if (balance > 0) {
        // Check if this is an NFT (balance = 1)
        if (balance === 1) {
          ownedNfts.push({
            mintAddress: mintAddress,
            balance: balance,
            tokenAccount: account.pubkey.toString()
          });
        }
      }
    }

    console.log(`✅ Found ${ownedNfts.length} owned NFTs`);
    return ownedNfts;
  } catch (error) {
    console.error("❌ Error finding owned NFTs:", error);
    return [];
  }
}

async function delegateNft(mintAddress) {
  try {
    console.log(`\n🔐 Delegating NFT: ${mintAddress}`);

    // Find PDAs
    const metadataPda = findMetadataPda(umi, { mint: publicKey(mintAddress) });
    const delegateRecordPda = findDelegateRecordPda(umi, {
      mint: publicKey(mintAddress),
      delegateRole: DelegateRole.AuthorityItem,
      delegate: escrowPda,
      updateAuthority: umiKeypair.publicKey,
    });

    console.log("📄 Metadata PDA:", metadataPda);
    console.log("🔐 Delegate Record PDA:", delegateRecordPda);

    // Delegate authority to redeem PDA
    const { signature } = await delegateAuthorityItemV1(umi, {
      mint: publicKey(mintAddress),
      authority: umiKeypair.publicKey,
      delegate: escrowPda,
      delegateRecord: delegateRecordPda,
      payer: umiKeypair.publicKey,
    }).sendAndConfirm(umi);

    console.log("✅ NFT delegated successfully!");
    console.log("📝 Transaction signature:", signature);
    
    return signature;
  } catch (err) {
    if (err.message.includes("DelegateRecordAlreadyExists")) {
      console.log("ℹ️  Authority already delegated for this NFT!");
      return null;
    } else {
      console.error("❌ NFT delegation failed:", err.message);
      throw err;
    }
  }
}

(async () => {
  console.log("🚀 Starting delegation of selected NFTs...");
  console.log("🔗 RPC:", NEXT_PUBLIC_SOLANA_RPC_HOST);
  console.log("👛 Wallet Authority:", umiKeypair.publicKey);
  console.log("🤝 Redeem PDA (Delegate):", NEXT_PUBLIC_ESCROW_PDA);

  try {
    // Only process the specified tokens
    const ownedNfts = TOKENS_TO_PROCESS.map(mintAddress => ({ mintAddress, balance: 1 }));

    if (ownedNfts.length === 0) {
      console.log("❌ No NFTs to process!");
      process.exit(1);
    }

    console.log("\n📋 NFTs to process:");
    ownedNfts.forEach((nft, index) => {
      console.log(`  ${index + 1}. ${nft.mintAddress}`);
    });

    // Delegate each NFT
    console.log("\n🔐 Starting delegation process...");
    const results = [];
    
    for (let i = 0; i < ownedNfts.length; i++) {
      const nft = ownedNfts[i];
      console.log(`\n[${i + 1}/${ownedNfts.length}] Processing NFT...`);
      
      try {
        const signature = await delegateNft(nft.mintAddress);
        results.push({
          mintAddress: nft.mintAddress,
          success: true,
          signature: signature
        });
      } catch (error) {
        console.error(`❌ Failed to delegate NFT ${nft.mintAddress}:`, error.message);
        results.push({
          mintAddress: nft.mintAddress,
          success: false,
          error: error.message
        });
      }
      
      // Add a small delay between transactions
      if (i < ownedNfts.length - 1) {
        console.log("⏳ Waiting 2 seconds before next transaction...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log("\n📊 Delegation Summary:");
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successfully delegated: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful > 0) {
      console.log("\n🎉 Delegation complete! You can now test the redeem button on your NFTs.");
      console.log("💡 The redeem PDA now has update authority for these NFTs.");
    }

    process.exit(0);

  } catch (err) {
    console.error("❌ Script failed:", err);
    process.exit(1);
  }
})(); 