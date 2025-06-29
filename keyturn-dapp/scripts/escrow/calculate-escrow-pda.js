import { PublicKey } from '@solana/web3.js';

// Program ID from environment variable
const PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID);

// Find the escrow PDA
const [escrowPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow')],
    PROGRAM_ID
);

console.log('🔧 Program ID:', PROGRAM_ID.toString());
console.log('🤝 Escrow PDA:', escrowPda.toString());
console.log('📊 Bump:', bump);

console.log('\n📋 Add this to your .env.local file:');
console.log(`NEXT_PUBLIC_ESCROW_PDA=${escrowPda.toString()}`);

console.log('\n💡 Use this escrow PDA as the update authority for your NFTs!');
console.log('   This PDA can delegate authority for metadata updates.'); 