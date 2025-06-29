import express from 'express';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { delegateCollectionV1 } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { PublicKey, Keypair } from '@solana/web3.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const REDEEM_PROGRAM_ID = new PublicKey('5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7');
const COLLECTION_MINT = new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);
const PORT = process.env.WEBHOOK_PORT || 3001;

// Load your wallet (update authority)
const walletPath = process.env.WALLET_KEYPAIR_PATH || '/Users/blairjdaniel/.config/solana/id.json';
const walletKeypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
);

// Generate escrow PDA
const [escrowPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('escrow')],
  REDEEM_PROGRAM_ID
);

const app = express();
app.use(express.json());

// Store processed transactions to avoid duplicates
const processedTransactions = new Set();

async function approveEscrowDelegate() {
  try {
    console.log('🔐 Checking if escrow PDA is already delegated...');
    
    // Setup Umi
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com')
      .use(keypairIdentity({
        publicKey: walletKeypair.publicKey.toBytes(),
        secretKey: walletKeypair.secretKey,
      }));

    // Approve the redeem escrow PDA as collection delegate
    const result = await delegateCollectionV1(umi, {
      mint: publicKey(COLLECTION_MINT.toString()),
      authority: publicKey(walletKeypair.publicKey.toString()),
      delegate: publicKey(escrowPda.toString()),
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);

    console.log(`✅ Delegation approved! Transaction: ${result.signature}`);
    return result.signature;
    
  } catch (error) {
    console.error('❌ Error approving delegate:', error);
    throw error;
  }
}

// Webhook endpoint
app.post('/api/mint-hook', async (req, res) => {
  try {
    console.log('📨 Received webhook notification:');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { type, account, candyMachine, timestamp, signature } = req.body;
    
    // Check if this is a new mint from our Candy Machine
    if (type === 'NFT_MINT' && candyMachine === process.env.NEXT_PUBLIC_CANDY_MACHINE_ID) {
      
      // Avoid processing duplicate transactions
      if (processedTransactions.has(signature)) {
        console.log('⏭️  Already processed this transaction, skipping...');
        return res.status(200).json({ message: 'Already processed' });
      }
      
      console.log(`🎯 New NFT mint detected!`);
      console.log(`📋 NFT Address: ${account}`);
      console.log(`📋 Candy Machine: ${candyMachine}`);
      console.log(`📋 Timestamp: ${timestamp}`);
      console.log(`📋 Transaction: ${signature}`);
      
      // Mark as processed
      processedTransactions.add(signature);
      
      // Approve delegation for the escrow PDA
      console.log('🔐 Approving escrow PDA as collection delegate...');
      const delegationTx = await approveEscrowDelegate();
      
      console.log('✅ Webhook processed successfully!');
      
      res.status(200).json({
        message: 'Webhook processed successfully',
        nftAddress: account,
        delegationTransaction: delegationTx,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.log('ℹ️  Not a relevant mint, ignoring...');
      res.status(200).json({ message: 'Not a relevant mint' });
    }
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    escrowPda: escrowPda.toString(),
    collectionMint: COLLECTION_MINT.toString(),
    candyMachine: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Webhook server started!');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/api/mint-hook`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Configuration:');
  console.log(`📋 Redeem Program ID: ${REDEEM_PROGRAM_ID.toString()}`);
  console.log(`📋 Collection Mint: ${COLLECTION_MINT.toString()}`);
  console.log(`📋 Escrow PDA: ${escrowPda.toString()}`);
  console.log(`👛 Wallet: ${walletKeypair.publicKey.toString()}`);
  console.log('');
  console.log('🎉 Ready to receive Helius webhook notifications!');
  console.log('📝 Next: Run "npm run setup-helius-webhook" to subscribe to mint events');
}); 