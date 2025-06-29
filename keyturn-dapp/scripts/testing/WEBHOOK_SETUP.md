# Webhook Endpoint Setup Guide

This guide will help you set up a webhook endpoint that automatically approves delegation when new NFTs are minted from your Candy Machine.

## 🚀 Quick Start

### 1. Start the Webhook Server
```bash
npm run webhook-server
```

This will start a server on `http://localhost:3001` that:
- Listens for Helius webhook notifications
- Automatically approves escrow PDA delegation when new mints are detected
- Provides health check endpoint

### 2. Set Up Helius Webhook Subscription
```bash
npm run setup-helius-webhook
```

This will:
- Subscribe to your Candy Machine mint events
- Configure Helius to call your webhook when new NFTs are minted

## 📋 Configuration

### Environment Variables (`.env.local`):
```bash
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_CANDY_MACHINE_ID=your_candy_machine_id
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=your_collection_mint
WEBHOOK_URL=http://localhost:3001/api/mint-hook  # For local testing
WEBHOOK_PORT=3001  # Optional, defaults to 3001
WALLET_KEYPAIR_PATH=/path/to/your/wallet.json
```

## 🔧 How It Works

### 1. User Mints NFT
- Someone mints an NFT from your Candy Machine
- Helius detects the mint event

### 2. Helius Calls Your Webhook
- Helius sends a POST request to your webhook endpoint
- Payload includes NFT address, Candy Machine ID, transaction signature

### 3. Webhook Processes the Mint
- Server receives the webhook notification
- Checks if it's from your Candy Machine
- Automatically approves escrow PDA as collection delegate
- Returns success response

### 4. Delegation is Ready
- Escrow PDA can now update metadata for all NFTs in collection
- No manual intervention needed

## 🌐 Production Deployment

For production, you'll need to:

1. **Deploy the webhook server** to a public URL (e.g., Vercel, Heroku, AWS)
2. **Update the webhook URL** in your environment variables
3. **Set up Helius subscription** with the production webhook URL

### Example Production Setup:
```bash
# Deploy to Vercel
vercel --prod

# Update webhook URL
WEBHOOK_URL=https://your-app.vercel.app/api/mint-hook

# Set up Helius subscription
npm run setup-helius-webhook
```

## 🧪 Testing

### Test the Webhook Server:
```bash
# Health check
curl http://localhost:3001/health

# Test webhook endpoint
curl -X POST http://localhost:3001/api/mint-hook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NFT_MINT",
    "account": "test_nft_address",
    "candyMachine": "your_candy_machine_id",
    "timestamp": "2024-01-01T00:00:00Z",
    "signature": "test_signature"
  }'
```

### Test with Real Mint:
1. Start the webhook server: `npm run webhook-server`
2. Set up Helius subscription: `npm run setup-helius-webhook`
3. Mint an NFT from your Candy Machine
4. Watch the webhook server logs for automatic delegation

## 📊 Monitoring

The webhook server provides:
- **Console logs** for all webhook events
- **Health check endpoint** at `/health`
- **Duplicate detection** to avoid processing the same transaction twice
- **Error handling** with detailed error messages

## 🔒 Security Considerations

- **HTTPS**: Use HTTPS in production
- **Authentication**: Consider adding webhook authentication
- **Rate Limiting**: Implement rate limiting if needed
- **Validation**: Validate webhook payloads
- **Error Handling**: Handle webhook failures gracefully

## 🎯 Next Steps

1. **Test locally** with the webhook server
2. **Deploy to production** when ready
3. **Monitor logs** for any issues
4. **Set up alerts** for webhook failures 