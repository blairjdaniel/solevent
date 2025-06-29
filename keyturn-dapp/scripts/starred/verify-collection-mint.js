#!/usr/bin/env node

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { findMetadataPda, fetchMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { findMasterEditionPda, fetchMasterEdition } from "@metaplex-foundation/mpl-token-metadata";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const COLLECTION_MINT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS;

if (!COLLECTION_MINT_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_COLLECTION_MINT_ADDRESS not found in .env.local');
  process.exit(1);
}

console.log('🔍 Verifying collection mint address...');
console.log('Collection Mint:', COLLECTION_MINT_ADDRESS);

// Create UMI instance
const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com');

(async () => {
  try {
    const collectionMint = publicKey(COLLECTION_MINT_ADDRESS);
    
    console.log('\n📋 Checking if mint exists...');
    
    // Check if the mint account exists
    const mintAccount = await umi.rpc.getAccount(collectionMint);
    
    if (!mintAccount.exists) {
      console.log('❌ Mint account does not exist on-chain');
      console.log('This means the collection mint address is invalid or the NFT was never minted.');
      process.exit(1);
    }
    
    console.log('✅ Mint account exists on-chain');
    console.log('Account size:', mintAccount.data.length, 'bytes');
    
    // Try to find metadata PDA
    console.log('\n📄 Checking metadata...');
    const metadataPda = findMetadataPda(umi, { mint: collectionMint });
    console.log('Metadata PDA:', metadataPda.toString());
    
    // Check if metadata account exists
    const metadataAccount = await umi.rpc.getAccount(metadataPda);
    
    if (!metadataAccount.exists) {
      console.log('❌ Metadata account does not exist');
      console.log('This means the NFT was never properly initialized with metadata.');
      process.exit(1);
    }
    
    console.log('✅ Metadata account exists');
    
    // Try to fetch metadata
    console.log('\n📊 Fetching metadata...');
    const metadata = await fetchMetadata(umi, metadataPda);
    
    console.log('✅ Metadata fetched successfully!');
    console.log('Name:', metadata.name);
    console.log('Symbol:', metadata.symbol);
    console.log('URI:', metadata.uri);
    console.log('Update Authority:', metadata.updateAuthority);
    console.log('Is Mutable:', metadata.isMutable);
    console.log('Seller Fee Basis Points:', metadata.sellerFeeBasisPoints);
    
    // Check if it has a master edition (required for collections)
    console.log('\n👑 Checking master edition...');
    try {
      const masterEditionPda = findMasterEditionPda(umi, { mint: collectionMint });
      const masterEdition = await fetchMasterEdition(umi, masterEditionPda);
      
      console.log('✅ Has master edition');
      console.log('Supply:', masterEdition.supply);
      console.log('Max Supply:', masterEdition.maxSupply);
      console.log('Is Collection: ✅ Yes (has master edition)');
      
    } catch (err) {
      console.log('❌ No master edition found');
      console.log('This NFT is not a collection NFT - it needs a master edition to be a collection.');
      console.log('Error:', err.message);
    }
    
    // Check collection info
    if (metadata.collection) {
      console.log('\n🔗 Collection Info:');
      console.log('Collection Key:', metadata.collection.key);
      console.log('Collection Verified:', metadata.collection.verified);
    } else {
      console.log('\n🔗 No collection reference found');
    }
    
  } catch (err) {
    console.error('❌ Error verifying collection:', err);
    console.log('\n💡 Possible issues:');
    console.log('1. The collection mint address is incorrect');
    console.log('2. The NFT was never properly minted');
    console.log('3. The metadata was never initialized');
    console.log('4. Network/RPC issues');
    
    process.exit(1);
  }
})(); 