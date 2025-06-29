import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { publicKey } from '@metaplex-foundation/umi';
import { PublicKey, Keypair } from '@solana/web3.js';
import mpl from '@metaplex-foundation/mpl-token-metadata';
import bs58 from 'bs58';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';

const { mplTokenMetadata, updateV1 } = mpl;

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const WALLET_SECRET_KEY_BASE58 = process.env.WALLET_SECRET_KEY_BASE58;
const NEXT_PUBLIC_SOLANA_RPC_HOST = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
const NEXT_PUBLIC_ESCROW_PDA = process.env.NEXT_PUBLIC_ESCROW_PDA;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mintAddress } = req.body;

    if (!mintAddress) {
      return res.status(400).json({ error: 'Mint address is required' });
    }

    console.log('🔒 Updating NFT to immutable using regular update instruction...');
    console.log('Mint:', mintAddress);
    console.log('Escrow PDA (Delegate):', NEXT_PUBLIC_ESCROW_PDA);

    // Decode base58 secret key and create UMI keypair
    const secretKey = bs58.decode(WALLET_SECRET_KEY_BASE58);
    const web3JsKeypair = Keypair.fromSecretKey(secretKey);
    const umiKeypair = fromWeb3JsKeypair(web3JsKeypair);

    // Create UMI instance
    const umi = createUmi(NEXT_PUBLIC_SOLANA_RPC_HOST)
      .use(mplTokenMetadata())
      .use(keypairIdentity(umiKeypair));

    // Prepare pubkeys
    const mint = publicKey(mintAddress);
    const escrowPda = publicKey(NEXT_PUBLIC_ESCROW_PDA);

    // Update NFT to immutable using the regular update instruction
    const { signature } = await updateV1(umi, {
      mint: mint,
      authority: umiKeypair.publicKey, // use wallet as authority
      isMutable: false, // make the NFT immutable
    }).sendAndConfirm(umi);

    console.log('✅ NFT updated to immutable successfully!');
    console.log('Transaction signature:', signature);

    res.status(200).json({
      success: true,
      signature: signature,
      message: 'NFT updated to immutable successfully'
    });

  } catch (error) {
    console.error('❌ Error updating NFT to immutable:', error);
    
    // Check if it's a delegation error
    if (error.message && error.message.includes('delegate')) {
      return res.status(400).json({
        error: 'Delegation error',
        message: 'The escrow PDA must be set as the Authority Item Delegate for this NFT before updating metadata. Please delegate the NFT first.',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update NFT',
      message: error.message
    });
  }
} 