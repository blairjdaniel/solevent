const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const connection = new Connection(process.env.RPC_HOST || 'https://api.devnet.solana.com');
const ESCROW_PDA = process.env.NEXT_PUBLIC_ESCROW_PDA;

async function checkDelegation() {
  console.log('🔍 Checking delegation status using RPC calls...\n');
  
  const mintsDir = path.join(__dirname, '..', 'mints');
  
  if (!fs.existsSync(mintsDir)) {
    console.log('❌ Mints directory not found');
    return;
  }
  
  const files = fs.readdirSync(mintsDir).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('❌ No JSON files found in mints directory');
    return;
  }
  
  console.log(`📁 Found ${files.length} mint JSON files\n`);
  
  for (const file of files) {
    try {
      const filePath = path.join(mintsDir, file);
      const mintData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Extract mint address
      let mintAddress;
      if (mintData.mintAddress) {
        mintAddress = mintData.mintAddress;
      } else if (mintData.mint) {
        mintAddress = mintData.mint;
      } else {
        console.log(`❌ Could not extract mint address from ${file}`);
        continue;
      }
      
      // Skip test addresses
      if (mintAddress === 'TestMintAddress123') {
        console.log(`⏭️  Skipping test mint: ${mintAddress}`);
        continue;
      }
      
      console.log(`🔍 Checking NFT: ${mintAddress}`);
      console.log(`📄 File: ${file}`);
      
      try {
        // Get the mint account info
        const mintInfo = await connection.getAccountInfo(new PublicKey(mintAddress));
        
        if (!mintInfo) {
          console.log(`❌ Mint account not found`);
          continue;
        }
        
        console.log(`✅ Mint account exists`);
        console.log(`   Owner: ${mintInfo.owner.toBase58()}`);
        
        // Get the metadata account
        const [metadataPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
            new PublicKey(mintAddress).toBuffer(),
          ],
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
        );
        
        const metadataInfo = await connection.getAccountInfo(metadataPda);
        
        if (metadataInfo) {
          console.log(`✅ Metadata account exists: ${metadataPda.toBase58()}`);
          
          // Parse metadata to find update authority
          // This is a simplified check - the actual metadata structure is more complex
          console.log(`📋 Metadata account size: ${metadataInfo.data.length} bytes`);
          
          // Check if there are any delegate records
          console.log(`🔍 Checking for delegate records...`);
          
          // Look for delegate record PDAs
          const [authorityItemDelegatePda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata'),
              new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
              new PublicKey(mintAddress).toBuffer(),
              Buffer.from('authority_item_delegate'),
              new PublicKey(ESCROW_PDA).toBuffer(),
            ],
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
          );
          
          const authorityItemDelegateInfo = await connection.getAccountInfo(authorityItemDelegatePda);
          
          if (authorityItemDelegateInfo) {
            console.log(`✅ Authority Item Delegate exists: ${authorityItemDelegatePda.toBase58()}`);
            console.log(`   Delegate: ${ESCROW_PDA}`);
            console.log(`   Status: ✅ Properly delegated to escrow PDA`);
          } else {
            console.log(`❌ No Authority Item Delegate found`);
          }
          
          // Check collection delegate
          const [collectionDelegatePda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata'),
              new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
              new PublicKey(mintAddress).toBuffer(),
              Buffer.from('collection_delegate'),
              new PublicKey(ESCROW_PDA).toBuffer(),
            ],
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
          );
          
          const collectionDelegateInfo = await connection.getAccountInfo(collectionDelegatePda);
          
          if (collectionDelegateInfo) {
            console.log(`✅ Collection Delegate exists: ${collectionDelegatePda.toBase58()}`);
            console.log(`   Delegate: ${ESCROW_PDA}`);
            console.log(`   Status: ✅ Properly delegated to escrow PDA`);
          } else {
            console.log(`❌ No Collection Delegate found`);
          }
          
        } else {
          console.log(`❌ Metadata account not found`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking mint: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.log(`❌ Error processing ${file}: ${error.message}\n`);
    }
  }
}

checkDelegation().catch(console.error); 