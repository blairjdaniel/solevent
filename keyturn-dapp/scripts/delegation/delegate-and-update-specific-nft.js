#!/usr/bin/env node

// Delegate authority and update metadata for a specific NFT
// Usage: node scripts/delegate-and-update-specific-nft.js <NFT_MINT_ADDRESS>

import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import mpl from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
const { mplTokenMetadata, delegateAuthorityItemV1, findMetadataPda, findDelegateRecordPda, updateMetadataV2 } = mpl;

// Load environment
dotenv.config({ path: "/Users/blairjdaniel/blairjdaniel/hoods-burrowborn/.env.local" });

const {
  WALLET_SECRET_KEY_BASE58,
  NEXT_PUBLIC_SOLANA_RPC_HOST,
  NEXT_PUBLIC_ESCROW_PDA,
} = process.env;

// Hard-coded metadata for each NFT
const NFT_METADATA = {
  "BH5cJCqFhK3K5pZqwqrHCNsQocNS2cgjbdXyDYuEDL33": {
    name: "BurrowBorn #1",
    symbol: "BB",
    uri: "https://arweave.net/your-metadata-uri-1",
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: "4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5ZHz59y",
        verified: true,
        share: 100
      }
    ],
    collection: null,
    uses: null
  },
  "2nMwwJCW7Fbx2V98aZBc1FeGY2hGZpGKGZB1coyoBRAt": {
    name: "BurrowBorn #2", 
    symbol: "BB",
    uri: "https://arweave.net/your-metadata-uri-2",
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: "4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5ZHz59y",
        verified: true,
        share: 100
      }
    ],
    collection: null,
    uses: null
  },
  "7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8": {
    name: "BurrowBorn #3",
    symbol: "BB", 
    uri: "https://arweave.net/your-metadata-uri-3",
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: "4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5ZHz59y",
        verified: true,
        share: 100
      }
    ],
    collection: null,
    uses: null
  },
  "DaRFnTaDSTnGHKwQhEKcoBnHBYbGZ34KWTPKmgw1f2Rp": {
    name: "BurrowBorn #4",
    symbol: "BB",
    uri: "https://arweave.net/your-metadata-uri-4", 
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: "4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5ZHz59y",
        verified: true,
        share: 100
      }
    ],
    collection: null,
    uses: null
  }
};

// Get NFT mint address from command line argument
const nftMintAddress = process.argv[2];

if (!nftMintAddress) {
  console.error("❌ NFT mint address required!");
  console.error("Usage: node scripts/delegate-and-update-specific-nft.js <NFT_MINT_ADDRESS>");
  process.exit(1);
}

// Check if we have metadata for this NFT
if (!NFT_METADATA[nftMintAddress]) {
  console.error(`❌ No metadata found for NFT: ${nftMintAddress}`);
  console.error("Available NFTs:", Object.keys(NFT_METADATA));
  process.exit(1);
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
  console.log("🔍 Processing NFT with delegation and metadata update...");
  console.log("🪙 NFT Mint:", nftMintAddress);
  console.log("👛 Current Authority:", umiKeypair.publicKey);
  console.log("🤝 Escrow Delegate:", NEXT_PUBLIC_ESCROW_PDA);

  const metadata = NFT_METADATA[nftMintAddress];
  console.log("📝 Metadata to apply:", metadata.name);

  try {
    // Step 1: Delegate authority to escrow PDA
    console.log("\n🔐 Step 1: Setting up authority delegation...");
    
    const metadataPda = findMetadataPda(umi, { mint: nftMint });
    const delegateRecordPda = findDelegateRecordPda(umi, {
      mint: nftMint,
      delegateRole: 0, // AuthorityItem = 0
      delegate: escrowPda,
      updateAuthority: umiKeypair.publicKey,
    });

    console.log("📄 Metadata PDA:", metadataPda);
    console.log("🔐 Delegate Record PDA:", delegateRecordPda);

    const { signature: delegateSignature } = await delegateAuthorityItemV1(umi, {
      mint: nftMint,
      authority: umiKeypair.publicKey,
      delegate: escrowPda,
      delegateRecord: delegateRecordPda,
      payer: umiKeypair.publicKey,
    }).sendAndConfirm(umi);

    console.log("✅ Authority delegated successfully!");
    console.log("📝 Delegation signature:", delegateSignature);

    // Step 2: Update metadata
    console.log("\n📝 Step 2: Updating metadata...");
    
    const { signature: updateSignature } = await updateMetadataV2(umi, {
      mint: nftMint,
      authority: umiKeypair.publicKey,
      data: {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        creators: metadata.creators,
        collection: metadata.collection,
        uses: metadata.uses,
      },
      updateAuthority: umiKeypair.publicKey,
      primarySaleHappened: null,
      isMutable: true,
    }).sendAndConfirm(umi);

    console.log("✅ Metadata updated successfully!");
    console.log("📝 Update signature:", updateSignature);

    console.log("\n🎉 NFT processing complete!");
    console.log("💡 The escrow PDA can now:");
    console.log("  • Update metadata on this NFT");
    console.log("  • Modify attributes, name, description, etc.");
    console.log("  • Control the NFT's metadata");

    process.exit(0);

  } catch (err) {
    console.error("❌ NFT processing failed:", err);
    
    if (err.message.includes("DelegateRecordAlreadyExists")) {
      console.log("ℹ️  Authority already delegated, proceeding with metadata update...");
      
      // Try just the metadata update
      try {
        console.log("\n📝 Updating metadata only...");
        
        const { signature: updateSignature } = await updateMetadataV2(umi, {
          mint: nftMint,
          authority: umiKeypair.publicKey,
          data: {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
            creators: metadata.creators,
            collection: metadata.collection,
            uses: metadata.uses,
          },
          updateAuthority: umiKeypair.publicKey,
          primarySaleHappened: null,
          isMutable: true,
        }).sendAndConfirm(umi);

        console.log("✅ Metadata updated successfully!");
        console.log("📝 Update signature:", updateSignature);
        process.exit(0);
        
      } catch (updateErr) {
        console.error("❌ Metadata update failed:", updateErr);
        process.exit(1);
      }
    } else {
      console.log("🔍 Error details:", err.message);
      process.exit(1);
    }
  }
})(); 