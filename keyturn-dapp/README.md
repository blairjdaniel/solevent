# SolEvent DApp - Solana NFT Minting Platform

A modern, out-of-the-box Solana Candy Machine minting dApp for the SolEvent NFT collection.

## Features

- 🎨 Modern, responsive UI with gradient backgrounds
- 🔗 Solana wallet integration (Phantom, etc.)
- 🍬 Candy Machine v3 support with Candy Guard
- 🎯 Real-time minting status and NFT display
- 🎉 Mint success popups and animations
- 📱 Mobile-friendly design
- 🔄 NFT redemption and escrow functionality
- 📊 Real-time wallet balance display

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom recommended)
- Solana Candy Machine v3 deployment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/solvent-dapp.git
cd solvent-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the project root:

```env
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# Candy Machine Configuration
NEXT_PUBLIC_CANDY_MACHINE_ID=your_candy_machine_id_here
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=your_collection_mint_address_here
NEXT_PUBLIC_TREASURY=your_treasury_address_here
NEXT_PUBLIC_CANDY_GUARD_ADDRESS=your_candy_guard_address_here
NEXT_PUBLIC_ESCROW_PDA=your_escrow_pda_here

# Collection Configuration
NEXT_PUBLIC_COLLECTION_NAME=SolEvent
NEXT_PUBLIC_COLLECTION_DESCRIPTION=A revolutionary NFT collection on Solana.

# Program IDs
NEXT_PUBLIC_METADATA_PROGRAM_ID=metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
NEXT_PUBLIC_REDEEM_PROGRAM_ID=your_redeem_program_id_here
NEXT_PUBLIC_REDEEM_PDA_SEED=your_redeem_pda_seed_here

# External Services
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 What You'll See

- **Modern UI**: Animated gradient background
- **Wallet Connection**: Connect your Solana wallet
- **Minting Interface**: Mint NFTs from your Candy Machine
- **NFT Gallery**: View your minted NFTs with redemption controls
- **Real-time Updates**: Live minting status and wallet balance

## Configuration

### Environment Variables

#### Solana Network
- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana network (devnet/mainnet-beta)
- `NEXT_PUBLIC_SOLANA_RPC_HOST`: RPC endpoint URL

#### Candy Machine
- `NEXT_PUBLIC_CANDY_MACHINE_ID`: Your Candy Machine v3 address
- `NEXT_PUBLIC_COLLECTION_MINT_ADDRESS`: Collection NFT mint address
- `NEXT_PUBLIC_TREASURY`: Treasury wallet address
- `NEXT_PUBLIC_CANDY_GUARD_ADDRESS`: Candy Guard address
- `NEXT_PUBLIC_ESCROW_PDA`: Escrow PDA address

#### Collection Branding
- `NEXT_PUBLIC_COLLECTION_NAME`: Your collection name
- `NEXT_PUBLIC_COLLECTION_DESCRIPTION`: Your collection description

#### Program IDs
- `NEXT_PUBLIC_METADATA_PROGRAM_ID`: Metaplex Token Metadata Program
- `NEXT_PUBLIC_REDEEM_PROGRAM_ID`: Your custom redeem program
- `NEXT_PUBLIC_REDEEM_PDA_SEED`: Seed for redeem PDA generation

#### External Services
- `NEXT_PUBLIC_PINATA_API_KEY`: Pinata API key for IPFS
- `NEXT_PUBLIC_PINATA_SECRET_API_KEY`: Pinata secret key
- `NEXT_PUBLIC_HELIUS_API_KEY`: Helius API key for NFT queries

### Customization

1. **Branding**: Update collection name and description via environment variables
2. **Styling**: Modify `src/styles.ts` for custom themes
3. **Background**: Replace gradient colors in `src/Home.tsx`
4. **Components**: Customize components in `src/components/`

## Project Structure

```
src/
├── components/          # React components
│   ├── CollectionImage.tsx
│   ├── ConnectButton.tsx
│   ├── MintButton.tsx
│   ├── MintSuccessPopup.tsx
│   ├── NFTDetailImageMetadata.tsx
│   ├── NFTDetailNFTMetadata.tsx
│   └── RedeemControls.tsx
├── hooks/              # Custom React hooks
│   ├── useCandyMachineV3.tsx
│   ├── useCollectionNft.tsx
│   ├── useMint.tsx
│   ├── useNftImages.tsx
│   ├── useNftMetadata.tsx
│   ├── useOwnedCollectionNft.tsx
│   ├── usePinataMetadata.tsx
│   ├── useRedeemProgram.tsx
│   ├── useUmi.tsx
│   ├── useWalletBalance.tsx
│   └── utils.ts
├── helpers/            # Utility functions
├── Home.tsx           # Main app component
├── main.tsx           # App entry point
├── config.ts          # Configuration
└── styles.ts          # Styled components

scripts/
├── checks/            # Verification scripts
├── delegation/        # NFT delegation scripts
├── escrow/           # Escrow PDA scripts
├── setup/            # Environment setup
├── utilities/        # Utility scripts
└── testing/          # Testing scripts

pages/
├── api/              # API endpoints
│   ├── deposit-hook.js
│   ├── mint-hook.js
│   └── update-metadata.js
├── _app.tsx          # App wrapper
└── index.tsx         # Entry page
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Blockchain**: Solana Web3.js, Metaplex Umi
- **Styling**: Styled Components, Emotion
- **Wallet**: Solana Wallet Adapter
- **NFT**: Candy Machine v3, MPL Core
- **IPFS**: Pinata for metadata storage
- **APIs**: Helius for NFT queries

## 🐛 Troubleshooting

### Common Issues

1. **"Candy Machine not found"**
   - Check your `NEXT_PUBLIC_CANDY_MACHINE_ID` is correct
   - Ensure you're on the right network (devnet/mainnet)

2. **"Wallet connection failed"**
   - Make sure you have a Solana wallet installed (Phantom recommended)
   - Check your browser console for errors

3. **"Minting failed"**
   - Verify your wallet has enough SOL
   - Check Candy Guard configuration
   - Ensure all environment variables are set

4. **"NFT redemption not working"**
   - Verify redeem program ID and PDA seed
   - Check escrow PDA configuration
   - Ensure webhook endpoints are properly configured

### Getting Help

- Check the documentation in the `README/` folder
- Review the analysis documents for detailed information
- Open an issue on GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the SolEvent team.