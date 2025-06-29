import { PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get Candy Machine ID from environment
const CANDY_MACHINE_ID_STRING = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;

if (!CANDY_MACHINE_ID_STRING) {
  console.error('❌ NEXT_PUBLIC_CANDY_MACHINE_ID not found in .env.local');
  console.log('Please add NEXT_PUBLIC_CANDY_MACHINE_ID to your .env.local file');
  process.exit(1);
}

// Your Candy Machine ID from config
const CANDY_MACHINE_ID = new PublicKey(CANDY_MACHINE_ID_STRING);

// Program ID from your escrow program
const PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID);

// Find the escrow PDA using the Candy Machine ID as a seed
const [escrowPda, bump] = PublicKey.findProgramAddressSync(
    [
        Buffer.from('escrow'),
        CANDY_MACHINE_ID.toBuffer()
    ],
    PROGRAM_ID
);

console.log('🍬 Candy Machine ID:', CANDY_MACHINE_ID.toString());
console.log('🔧 Program ID:', PROGRAM_ID.toString());
console.log('🤝 Escrow PDA:', escrowPda.toString());
console.log('📊 Bump:', bump);

console.log('\n📋 Add this to your .env.local file:');
console.log(`NEXT_PUBLIC_ESCROW_PDA=${escrowPda.toString()}`);

console.log('\n💡 This escrow PDA is unique to your Candy Machine!');
console.log('   It can only be used with this specific Candy Machine ID.');
console.log('   Use it as the update authority for your NFTs.'); 