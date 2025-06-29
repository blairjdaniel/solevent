# 4. Setting Up External Services (Vercel, Helius, Pinata)

This guide covers setting up the external services needed for the SolEvent DApp.

## Prerequisites

- Next.js application configured
- Solana wallet with SOL
- GitHub repository set up

## Step 1: Set Up Vercel

### Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Connect your repository

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: solvent-dapp (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings: No
```

### Configure Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all your environment variables:

```env
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# Candy Machine Configuration
NEXT_PUBLIC_CANDY_MACHINE_ID=YOUR_CANDY_MACHINE_ID
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=YOUR_COLLECTION_MINT_ADDRESS
NEXT_PUBLIC_TREASURY=YOUR_TREASURY_ADDRESS
NEXT_PUBLIC_CANDY_GUARD_ADDRESS=YOUR_GUARD_ADDRESS
NEXT_PUBLIC_ESCROW_PDA=YOUR_ESCROW_PDA

# Collection Configuration
NEXT_PUBLIC_COLLECTION_NAME=SolEvent
NEXT_PUBLIC_COLLECTION_DESCRIPTION=A revolutionary NFT collection on Solana

# Program IDs
NEXT_PUBLIC_METADATA_PROGRAM_ID=metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
NEXT_PUBLIC_REDEEM_PROGRAM_ID=YOUR_REDEEM_PROGRAM_ID
NEXT_PUBLIC_REDEEM_PDA_SEED=YOUR_REDEEM_PDA_SEED

# External Services
NEXT_PUBLIC_PINATA_API_KEY=YOUR_PINATA_API_KEY
NEXT_PUBLIC_PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_KEY
NEXT_PUBLIC_HELIUS_API_KEY=YOUR_HELIUS_API_KEY
```

### Configure Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Step 2: Set Up Helius

### Create Helius Account
1. Go to [helius.xyz](https://helius.xyz)
2. Sign up for an account
3. Navigate to the dashboard

### Get API Key
1. Go to API Keys section
2. Create a new API key
3. Select the appropriate plan (free tier available)
4. Copy the API key

### Configure Helius in Your App
Update your environment variables:
```env
NEXT_PUBLIC_HELIUS_API_KEY=YOUR_HELIUS_API_KEY
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
```

### Test Helius Integration
```bash
# Test the API key
curl -X POST https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "getHealth"
  }'
```

## Step 3: Set Up Pinata

### Create Pinata Account
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for an account
3. Verify your email

### Get API Keys
1. Go to API Keys section
2. Create a new API key
3. Enable the following permissions:
   - Pin File to IPFS
   - Pin JSON to IPFS
   - Pin by Hash
4. Copy both the API Key and Secret Key

### Configure Pinata in Your App
Update your environment variables:
```env
NEXT_PUBLIC_PINATA_API_KEY=YOUR_PINATA_API_KEY
NEXT_PUBLIC_PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_KEY
NEXT_PUBLIC_PINATA_API_URL=https://api.pinata.cloud/pinning/pinFileToIPFS
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Test Pinata Integration
```bash
# Test uploading a file
curl -X POST https://api.pinata.cloud/pinning/pinFileToIPFS \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
  -F "file=@test.txt"
```

## Step 4: Configure Webhooks (Optional)

### Set Up Vercel Webhooks
1. Go to your Vercel project settings
2. Navigate to Functions → Webhooks
3. Create webhooks for:
   - Mint events
   - Deposit events
   - Transfer events

### Configure Webhook Endpoints
Update your API routes to handle webhooks:

```javascript
// pages/api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;
    
    switch (type) {
      case 'mint':
        // Handle mint event
        console.log('Mint event:', data);
        break;
      case 'deposit':
        // Handle deposit event
        console.log('Deposit event:', data);
        break;
      default:
        console.log('Unknown event type:', type);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Step 5: Configure CORS and Security

### Update Next.js Config
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

## Step 6: Test External Services

### Test Helius NFT Queries
```javascript
// Test in browser console or API route
const response = await fetch('https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: '1',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress: 'YOUR_WALLET_ADDRESS',
      page: 1,
      limit: 10,
    },
  }),
});

const data = await response.json();
console.log('NFTs:', data.result.items);
```

### Test Pinata Upload
```javascript
// Test metadata upload
const metadata = {
  name: 'Test NFT',
  symbol: 'TEST',
  description: 'Test NFT for verification',
  image: 'ipfs://QmTestHash',
  attributes: []
};

const formData = new FormData();
formData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');

const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: {
    'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
    'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  },
  body: formData,
});

const result = await response.json();
console.log('Upload result:', result);
```

## Step 7: Monitor and Debug

### Set Up Logging
```javascript
// Add to your API routes
export default async function handler(req, res) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Your handler logic here
}
```

### Monitor Vercel Deployments
1. Go to your Vercel dashboard
2. Check deployment logs
3. Monitor function execution times
4. Set up alerts for errors

### Monitor Helius Usage
1. Check API usage in Helius dashboard
2. Monitor rate limits
3. Review query performance

### Monitor Pinata Usage
1. Check storage usage
2. Monitor API calls
3. Review upload success rates

## Troubleshooting

### Common Issues

**"Vercel deployment failed"**
```bash
# Check build logs
# Verify environment variables
# Test locally first
npm run build
```

**"Helius API errors"**
```bash
# Verify API key
# Check rate limits
# Test with curl first
```

**"Pinata upload failed"**
```bash
# Verify API keys
# Check file size limits
# Test with smaller files
```

### Verification Checklist

- [ ] Vercel account created and connected
- [ ] Environment variables set in Vercel
- [ ] Helius API key obtained and configured
- [ ] Pinata API keys obtained and configured
- [ ] Webhooks configured (if needed)
- [ ] CORS headers configured
- [ ] All services tested and working
- [ ] Monitoring set up

## Next Steps

Once external services are configured:
- [Configure wallet connections](./05-wallet-connections.md)
- [Connect everything together](./06-connecting-everything.md)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Helius Documentation](https://docs.helius.xyz/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) 