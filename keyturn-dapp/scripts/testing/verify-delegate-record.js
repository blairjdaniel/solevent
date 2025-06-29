import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const REDEEM_PROGRAM_ID = new PublicKey('5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7');
const COLLECTION_MINT = new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);
const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || '4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5ZHz59y';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
const metaplex = Metaplex.make(connection);

// Generate escrow PDA
const [escrowPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('escrow')],
  REDEEM_PROGRAM_ID
);

async function verifyDelegateRecord() {
  try {
    console.log('🔍 Verifying delegate record on-chain...');
    console.log(`📋 Collection Mint: ${COLLECTION_MINT.toString()}`);
    console.log(`📋 Update Authority: ${WALLET_PUBLIC_KEY}`);
    console.log(`📋 Escrow PDA (Delegate): ${escrowPda.toString()}`);
    console.log('');

    // Generate the delegate record PDA
    const delegateRecordPda = metaplex.nfts().pdas().collectionDelegateRecord({
      mint: COLLECTION_MINT,
      delegate: escrowPda,
    });

    console.log(`📋 Delegate Record PDA: ${delegateRecordPda.toString()}`);

    // Check if the delegate record account exists
    const delegateRecordAccount = await connection.getAccountInfo(delegateRecordPda);
    
    if (delegateRecordAccount) {
      console.log('✅ Delegate record EXISTS on-chain!');
      console.log(`📊 Account size: ${delegateRecordAccount.data.length} bytes`);
      console.log(`💰 Rent: ${delegateRecordAccount.lamports} lamports`);
      console.log(`🔑 Owner: ${delegateRecordAccount.owner.toString()}`);
      console.log('');
      console.log('🎉 Your escrow PDA is successfully approved as a collection delegate!');
      console.log('📝 It can now update metadata for all NFTs in your collection.');
      
      return true;
    } else {
      console.log('❌ Delegate record does NOT exist on-chain');
      console.log('📝 The escrow PDA has not been approved as a delegate yet.');
      console.log('');
      console.log('🔧 To approve delegation, run:');
      console.log('npm run approve-delegate-umi');
      
      return false;
    }

  } catch (error) {
    console.error('❌ Error verifying delegate record:', error);
    return false;
  }
}

// Alternative verification using CLI command format
async function showCLICommand() {
  console.log('\n📋 CLI Command to verify (if you have metaplex CLI installed):');
  console.log(`metaplex token-metadata delegate-record \\`);
  console.log(`  --mint ${COLLECTION_MINT.toString()} \\`);
  console.log(`  --update-authority ${WALLET_PUBLIC_KEY} \\`);
  console.log(`  --delegate-role AuthorityItem \\`);
  console.log(`  --rpc-url https://api.devnet.solana.com`);
  console.log('');
  console.log('🔗 Or check on Solana Explorer:');
  console.log(`https://explorer.solana.com/address/${escrowPda.toString()}?cluster=devnet`);
}

// Run the verification
async function main() {
  const exists = await verifyDelegateRecord();
  await showCLICommand();
  
  if (exists) {
    console.log('\n🎯 Verification complete - delegation is active!');
  } else {
    console.log('\n⚠️  Verification complete - delegation needs to be approved.');
  }
}

main().catch(console.error); 