const { Connection, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com');
const WALLET_SECRET_KEY_BASE58 = process.env.WALLET_SECRET_KEY_BASE58;
const NEXT_PUBLIC_ESCROW_PDA = process.env.NEXT_PUBLIC_ESCROW_PDA;

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function delegateNFT(mintAddress) {
  console.log('🔐 Delegating NFT to escrow PDA using manual approach...');
  console.log('Mint:', mintAddress);
  console.log('Escrow PDA:', NEXT_PUBLIC_ESCROW_PDA);

  try {
    // Decode wallet secret key
    const secretKey = bs58.decode(WALLET_SECRET_KEY_BASE58);
    const wallet = Keypair.fromSecretKey(secretKey);
    const escrowPda = new PublicKey(NEXT_PUBLIC_ESCROW_PDA);
    const mintPubkey = new PublicKey(mintAddress);

    console.log('Wallet Authority:', wallet.publicKey.toString());

    // Calculate metadata PDA
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // Calculate delegate record PDA for Authority Item Delegate
    const [delegateRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
        Buffer.from('authority_item_delegate'),
        escrowPda.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    console.log('Metadata PDA:', metadataPda.toString());
    console.log('Delegate Record PDA:', delegateRecordPda.toString());

    // Create delegate instruction
    // Instruction discriminator for delegate_authority_item_v1: [0x5a, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90]
    const delegateInstruction = new TransactionInstruction({
      keys: [
        { pubkey: metadataPda, isSigner: false, isWritable: true },
        { pubkey: delegateRecordPda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false }, // update authority
        { pubkey: escrowPda, isSigner: false, isWritable: false }, // delegate
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // payer
        { pubkey: PublicKey.SystemProgramId, isSigner: false, isWritable: false },
      ],
      programId: METADATA_PROGRAM_ID,
      data: Buffer.from([
        // DelegateAuthorityItemV1 instruction discriminator (correct one)
        0x5a, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90,
        // delegate_role: AuthorityItem = 0
        0,
        // authorization_data: None (empty)
        0
      ])
    });

    const transaction = new Transaction().add(delegateInstruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction
    transaction.sign(wallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('✅ NFT delegated successfully!');
    console.log('Transaction signature:', signature);
    
    return signature;
  } catch (error) {
    console.error('❌ Error delegating NFT:', error);
    throw error;
  }
}

// Get mint address from command line argument
const mintAddress = process.argv[2];
if (!mintAddress) {
  console.error('Usage: node scripts/simple-delegate.cjs <MINT_ADDRESS>');
  process.exit(1);
}

delegateNFT(mintAddress).catch(console.error); 