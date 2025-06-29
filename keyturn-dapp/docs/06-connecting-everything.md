# 6. Connecting Everything Together and Running npm run dev

This guide covers the final integration steps to connect all components and run the complete SolEvent DApp.

## Prerequisites

- All previous steps completed
- Environment variables configured
- External services set up
- Wallet connections working

## Step 1: Final Environment Configuration

### Verify Complete Environment Setup
Ensure your `.env.local` contains all required variables:

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
NEXT_PUBLIC_PINATA_API_URL=https://api.pinata.cloud/pinning/pinFileToIPFS
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_HELIUS_API_KEY=YOUR_HELIUS_API_KEY
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Step 2: Verify All Dependencies

### Check Package.json
Ensure all required dependencies are installed:

```bash
# Check if all dependencies are installed
npm list --depth=0

# Install any missing dependencies
npm install

# Clear cache if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Verify TypeScript Configuration
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Should complete without errors
```

## Step 3: Final Application Configuration

### Update Main Application File
Ensure `src/Home.tsx` imports all necessary components:

```typescript
import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState, useRef } from "react";
import { MintButton } from "./components/MintButton";
import {
  Section,
  Container,
  Column,
  Header,
  WalletContainer,
  Wallet,
  WalletAmount,
  ConnectButton,
  ConnectWallet,
  Content,
  CollectionName,
  CollectionDescription,
  MintButtonStyle
} from "./styles";
import { AlertState } from "./utils";
import { useCandyMachineV3 } from "./hooks/useCandyMachineV3";
import { useUmi } from "./hooks/useUmi";
import { useCollectionNft } from "./hooks/useCollectionNft";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { CollectionImage } from "./components/CollectionImage";
import { logMintContext } from "./helpers/logs";
import { useMint } from "./hooks/useMint";
import { NFTDetailImageMetadata } from "./components/NFTDetailImageMetadata";
import { NFTDetailNFTMetadata } from "./components/NFTDetailNFTMetadata";
import { useOwnedCollectionNft } from "./hooks/useOwnedCollectionNft";
import { useNftImages } from "./hooks/useNftImages";
import { fetchNftMetadata } from "./hooks/utils";
import { RedeemControls } from "./components/RedeemControls";
import { collectionMintAddress, treasury, candyGuardAddress, COLLECTION_NAME, COLLECTION_DESCRIPTION } from "./config";
import MintSuccessPopup from "./components/MintSuccessPopup";
import { useMintSuccessPopup } from "./hooks/useMintSuccessPopup";
```

### Configure Error Boundaries
Update `src/helpers/ErrorBoundary.tsx`:

```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: 'white',
          background: 'linear-gradient(-45deg, #667eea, #764ba2)'
        }}>
          <h1>Something went wrong.</h1>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Step 4: Start the Development Server

### Run the Application
```bash
# Start the development server
npm run dev

# The application should start and be available at http://localhost:3000
```

### Monitor Console Output
Watch for any errors or warnings in the terminal:

```bash
# Expected output:
# - ready - started server on 0.0.0.0:3000, url: http://localhost:3000
# - event - compiled client and server successfully
# - info  - Loaded env from .env.local
```

## Step 5: Verify Application Startup

### Check Browser Console
Open browser developer tools and check for:

1. **Configuration Loading**:
```
🔧 SolEvent DApp Config loaded:
  NETWORK: devnet
  rpcHost: https://api.devnet.solana.com
  candyMachineId: YOUR_CANDY_MACHINE_ID
  collectionMintAddress: YOUR_COLLECTION_MINT_ADDRESS
  treasury: YOUR_TREASURY_ADDRESS
  candyGuardAddress: YOUR_GUARD_ADDRESS
  escrowAddress: YOUR_ESCROW_PDA
  COLLECTION_NAME: SolEvent
  COLLECTION_DESCRIPTION: A revolutionary NFT collection on Solana
```

2. **No Critical Errors**:
- No missing environment variables
- No failed imports
- No network connection errors

### Verify Page Load
The application should display:
- Collection name and description
- Connect Wallet button
- Loading state for Candy Machine data

## Step 6: Test Core Functionality

### Test Wallet Connection
1. Click "Connect Wallet" button
2. Approve connection in wallet extension
3. Verify wallet address and balance display

### Test Candy Machine Loading
1. Wait for Candy Machine data to load
2. Verify mint button appears
3. Check that collection information displays correctly

### Test Minting (Optional)
1. Ensure wallet has sufficient SOL
2. Click "Mint" button
3. Approve transaction in wallet
4. Verify NFT appears in wallet

## Step 7: Debug Common Issues

### Environment Variable Issues
```bash
# Check if variables are loaded
console.log('Environment check:', {
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  candyMachine: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID,
  collection: process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS
});
```

### Network Connection Issues
```bash
# Test RPC connection
curl -X POST https://api.devnet.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check for TypeScript errors
npx tsc --noEmit
```

## Step 8: Performance Optimization

### Enable Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Monitor Performance
- Check bundle size in browser dev tools
- Monitor network requests
- Verify image loading performance

## Troubleshooting

### Common Startup Issues

**"Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**"Environment variables not loading"**
```bash
# Restart development server
# Check .env.local file location
# Verify variable names start with NEXT_PUBLIC_
```

**"Candy Machine not found"**
```bash
# Verify Candy Machine ID
# Check network configuration
# Ensure Candy Machine is deployed
```

**"Wallet connection failed"**
```bash
# Check wallet extension is installed
# Verify wallet is unlocked
# Check browser console for errors
```

### Verification Checklist

- [ ] All environment variables set
- [ ] Dependencies installed correctly
- [ ] TypeScript compilation successful
- [ ] Development server starts without errors
- [ ] Application loads in browser
- [ ] Configuration logs appear in console
- [ ] Wallet connects successfully
- [ ] Candy Machine data loads
- [ ] No critical errors in console
- [ ] All components render correctly

## Next Steps

Once the application is running successfully:
- [Test the complete application](./07-testing.md)
- [Deploy to Vercel](./08-deployment.md)

## Resources

- [Next.js Development](https://nextjs.org/docs/development)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Solana Explorer](https://explorer.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/) 