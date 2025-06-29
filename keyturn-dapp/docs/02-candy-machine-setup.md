# 2. Setting Up Candy Machine

This guide covers setting up a Solana Candy Machine v3 for your NFT collection.

## Prerequisites

- Solana CLI installed
- A Solana wallet with SOL for deployment
- Sugar CLI installed
- NFT assets ready (images and metadata)

## Step 1: Install Required Tools

### Install Solana CLI
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
```

### Install Sugar CLI
```bash
# Install Sugar CLI
curl --proto '=https' --tlsv1.2 -sSf https://docs.metaplex.com/scripts/install-sugar.sh | bash

# Verify installation
sugar --version
```

## Step 2: Configure Solana

```bash
# Set to devnet for testing
solana config set --url devnet

# Create a new wallet (if needed)
solana-keygen new --outfile ~/.config/solana/dev-wallet.json

# Set as default wallet
solana config set --keypair ~/.config/solana/dev-wallet.json

# Check balance
solana balance

# Airdrop SOL (devnet only)
solana airdrop 2
```

## Step 3: Prepare NFT Assets

### Asset Structure
Your assets should be organized as follows:
```
burrowborn_candy/
├── assets/
│   ├── 0.png
│   ├── 0.json
│   ├── 1.png
│   ├── 1.json
│   └── ...
├── config.json
└── collection.json
```

### Metadata Format
Each JSON file should follow this structure:
```json
{
  "name": "SolEvent #0",
  "symbol": "SE",
  "description": "A revolutionary NFT collection on Solana",
  "image": "0.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Type",
      "value": "Common"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "0.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

## Step 4: Configure Candy Machine

### Create Configuration File
```bash
# Navigate to your assets directory
cd burrowborn_candy

# Create config.json
```

Example `config.json`:
```json
{
  "price": 0.01,
  "number": 16,
  "symbol": "SE",
  "sellerFeeBasisPoints": 500,
  "gatekeeper": null,
  "solTreasuryAccount": "YOUR_TREASURY_WALLET_ADDRESS",
  "splTokenAccount": null,
  "splToken": null,
  "goLiveDate": "2024-01-01T00:00:00Z",
  "endSettings": null,
  "whitelistMintSettings": null,
  "hiddenSettings": null,
  "uploadMethod": "bundlr",
  "retainAuthority": true,
  "isMutable": true,
  "creators": [
    {
      "address": "YOUR_CREATOR_WALLET_ADDRESS",
      "share": 100
    }
  ]
}
```

## Step 5: Deploy Candy Machine

### Upload Assets
```bash
# Upload assets to Arweave
sugar upload

# Verify upload
sugar verify
```

### Deploy Candy Machine
```bash
# Deploy the Candy Machine
sugar deploy

# Note the Candy Machine ID from output
# Example: Candy Machine ID: DyrMyfhTeMLG5QYXAV2YxfisWQfT76Qhz55CcCCUEDqu
```

### Deploy Candy Guard (Optional)
```bash
# Create Candy Guard
sugar guard create

# Configure guard settings
sugar guard add --rule sol_payment --amount 0.01

# Deploy guard
sugar guard deploy

# Set guard on Candy Machine
sugar guard set --candy-machine YOUR_CANDY_MACHINE_ID
```

## Step 6: Verify Deployment

### Check Candy Machine Status
```bash
# Show Candy Machine details
sugar show

# Expected output:
# 🍬 Candy machine ID: YOUR_CANDY_MACHINE_ID
# :.. authority: YOUR_AUTHORITY_ADDRESS
# :.. mint authority: YOUR_MINT_AUTHORITY
# :.. collection mint: YOUR_COLLECTION_MINT
# :.. account version: V2
# :.. token standard: NonFungible
# :.. max supply: 0
# :.. items redeemed: 0
# :.. items available: 16
```

### Check Candy Guard (if deployed)
```bash
# Show guard details
sugar guard show

# Expected output:
# 🛡  Candy Guard ID: YOUR_GUARD_ID
# :.. authority: YOUR_AUTHORITY_ADDRESS
# :.. data: 
#     :.. default: 
#       :.. sol payment: 
#         :.. lamports: 10000000 (◎ 0.01)
#         :.. destination: YOUR_TREASURY_ADDRESS
```

## Step 7: Update Environment Variables

Add the following to your `.env.local`:

```env
# Candy Machine Configuration
NEXT_PUBLIC_CANDY_MACHINE_ID=YOUR_CANDY_MACHINE_ID
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=YOUR_COLLECTION_MINT_ADDRESS
NEXT_PUBLIC_TREASURY=YOUR_TREASURY_ADDRESS
NEXT_PUBLIC_CANDY_GUARD_ADDRESS=YOUR_GUARD_ADDRESS

# Collection Configuration
NEXT_PUBLIC_COLLECTION_NAME=SolEvent
NEXT_PUBLIC_COLLECTION_DESCRIPTION=A revolutionary NFT collection on Solana
```

## Step 8: Test Minting

### Test with Sugar CLI
```bash
# Test mint an NFT
sugar mint --candy-machine YOUR_CANDY_MACHINE_ID

# Verify mint
sugar verify
```

### Test with DApp
```bash
# Start development server
npm run dev

# Navigate to http://localhost:3000
# Connect wallet and test minting
```

## Troubleshooting

### Common Issues

**"Insufficient SOL"**
```bash
# Check balance
solana balance

# Airdrop more SOL (devnet only)
solana airdrop 2
```

**"Upload failed"**
```bash
# Check network connection
# Verify assets are properly formatted
# Try uploading smaller batches
```

**"Candy Machine not found"**
```bash
# Verify Candy Machine ID
# Check network configuration
# Ensure wallet has authority
```

### Verification Checklist

- [ ] Solana CLI installed and configured
- [ ] Sugar CLI installed
- [ ] Assets properly formatted and uploaded
- [ ] Candy Machine deployed successfully
- [ ] Candy Guard configured (if needed)
- [ ] Environment variables updated
- [ ] Test mint successful
- [ ] DApp can connect to Candy Machine

## Next Steps

Once your Candy Machine is deployed and tested:
- [Configure Next.js and Home.tsx](./03-nextjs-setup.md)
- [Set up external services](./04-external-services.md)

## Resources

- [Metaplex Documentation](https://docs.metaplex.com/)
- [Sugar CLI Guide](https://docs.metaplex.com/developer-tools/sugar)
- [Candy Machine v3 Spec](https://docs.metaplex.com/programs/candy-machine/)
- [Solana Devnet Faucet](https://faucet.solana.com/) 