import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const CANDY_MACHINE_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-server.com/api/mint-hook'; // Update this to your actual webhook URL

async function setupHeliusWebhook() {
  try {
    console.log('🚀 Setting up Helius webhook for Candy Machine mints...');
    console.log(`📋 Candy Machine ID: ${CANDY_MACHINE_ID}`);
    console.log(`📋 Webhook URL: ${WEBHOOK_URL}`);
    console.log(`🔑 Helius API Key: ${HELIUS_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log('');

    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is required. Please set NEXT_PUBLIC_HELIUS_API_KEY in your .env.local file.');
    }

    if (!CANDY_MACHINE_ID) {
      throw new Error('CANDY_MACHINE_ID is required. Please set NEXT_PUBLIC_CANDY_MACHINE_ID in your .env.local file.');
    }

    const payload = {
      type: "nftDrop",           // NFTDrop = Candy Machine v2 mints
      account: CANDY_MACHINE_ID, // your machine ID
      env: "DEVNET",             // or "MAINNET" for mainnet
      webhook: WEBHOOK_URL       // your webhook endpoint
    };

    console.log('📝 Sending webhook subscription request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('');

    const response = await fetch('https://api.helius.xyz/v0/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': HELIUS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Webhook subscription created successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('');
      console.log('🎉 Helius will now call your webhook whenever someone mints from your Candy Machine!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Set up your webhook endpoint at:', WEBHOOK_URL);
      console.log('2. Your webhook will receive POST requests with mint data');
      console.log('3. In your webhook, you can call the delegation script');
    } else {
      console.error('❌ Failed to create webhook subscription:');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
    }

    return result;

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    return null;
  }
}

// Run the script
setupHeliusWebhook().catch(console.error); 