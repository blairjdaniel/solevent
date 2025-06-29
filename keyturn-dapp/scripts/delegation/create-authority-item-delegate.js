import { createUmi, publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { delegateAuthorityItemV1 } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

// Configuration
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const MINT_ADDRESS = '7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8';
const DELEGATE_ADDRESS = '2ANVeQAjk3XyQpXvgzPH99AvPv2aUX6cCJWd5BQ2FACy'; // Your escrow PDA
const WALLET_PATH = process.env.WALLET_KEYPAIR_PATH || '/Users/blairjdaniel/.config/solana/id.json';

async function main() {
  try {
    console.log('🔍 Loading wallet keypair...');
    const keypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8')))
    );
    console.log('✅ Wallet loaded:', keypair.publicKey.toString());

    console.log('🔗 Connecting to RPC...');
    const umi = createUmi(RPC_ENDPOINT)
      .use(keypairIdentity({
        publicKey: keypair.publicKey.toBytes(),
        secretKey: keypair.secretKey,
      }))
      .use(mplTokenMetadata());

    console.log('🔄 Creating AuthorityItem delegate record...');
    console.log('   Mint:', MINT_ADDRESS);
    console.log('   Delegate:', DELEGATE_ADDRESS);
    console.log('   Update Authority:', keypair.publicKey.toString());

    const tx = await delegateAuthorityItemV1(umi, {
      mint: publicKey(MINT_ADDRESS),
      updateAuthority: publicKey(keypair.publicKey.toString()),
      delegate: publicKey(DELEGATE_ADDRESS),
    }).sendAndConfirm(umi);

    console.log('✅ AuthorityItem delegate record created successfully!');
    console.log('📝 Transaction signature:', tx.signature);

    // Calculate and show the delegate record PDA
    const { PublicKey } = await import('@solana/web3.js');
    const [delegateRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        new PublicKey(MINT_ADDRESS).toBuffer(),
        Buffer.from('delegate'),
        keypair.publicKey.toBuffer(),
        new PublicKey(DELEGATE_ADDRESS).toBuffer(),
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    );

    console.log('📋 Delegate Record PDA:', delegateRecordPda.toString());

    // Wait a moment and verify
    console.log('🔍 Verifying delegate record...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const connection = new (await import('@solana/web3.js')).Connection(RPC_ENDPOINT, 'confirmed');
    const delegateRecordAccount = await connection.getAccountInfo(delegateRecordPda);
    
    if (delegateRecordAccount) {
      console.log('✅ Delegate record verified on-chain!');
      console.log('🎉 Your escrow PDA can now update this NFT as an AuthorityItem delegate!');
    } else {
      console.log('⚠️  Delegate record not found on-chain yet (may need confirmation)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 