# 3. Setting Up Next.js and Home.tsx

This guide covers configuring Next.js and customizing the main application component.

## Prerequisites

- Project cloned and dependencies installed
- Candy Machine deployed and configured
- Environment variables set up

## Step 1: Verify Next.js Configuration

### Check `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
}

module.exports = nextConfig
```

### Check `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 2: Configure Environment Variables

### Update `.env.local`
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

## Step 3: Configure Main Application Files

### Update `src/config.ts`
```typescript
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, PublicKey, Cluster } from "@solana/web3.js";

// Solana Network Configuration
export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as Cluster;

export const rpcHost =
  process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl(NETWORK);

// Candy Machine Configuration
const candyMachineIdString = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
if (!candyMachineIdString) {
  throw new Error('NEXT_PUBLIC_CANDY_MACHINE_ID environment variable is required');
}

export const candyMachineId = new PublicKey(candyMachineIdString);

// Optional Configuration
export const collectionMintAddress = process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS;
export const treasury = process.env.NEXT_PUBLIC_TREASURY;
export const candyGuardAddress = process.env.NEXT_PUBLIC_CANDY_GUARD_ADDRESS;
export const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_PDA;

// Collection Configuration
export const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'SolEvent';
export const COLLECTION_DESCRIPTION = process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION || 'A revolutionary NFT collection on Solana.';

// Wallet Configuration
export const WALLET_KEYPAIR = process.env.WALLET_SECRET_KEY || "~/.config/solana/dev-wallet.json";
```

### Update `src/main.tsx`
```typescript
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import React from "react";
import { useMemo } from "react";
import Home from "./Home";
import { rpcHost, candyMachineId } from "./config";

const theme = createTheme({ palette: { mode: "dark" } })

const Main = () => {
  const endpoint = useMemo(() => rpcHost, []);

  // Add global error handler to suppress extension connection errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Could not establish connection') || 
          event.message.includes('Receiving end does not exist')) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('Could not establish connection')) {
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <Home candyMachineId={candyMachineId.toBase58()} />   
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default Main;
```

## Step 4: Customize Home.tsx

### Key Components to Customize

#### Collection Branding
```typescript
// In src/Home.tsx
import { COLLECTION_NAME, COLLECTION_DESCRIPTION } from "./config";

// Update the collection display
<CollectionName>{COLLECTION_NAME}</CollectionName>
<CollectionDescription>
  {COLLECTION_DESCRIPTION}
</CollectionDescription>
```

#### Background Styling
```typescript
// Customize the gradient background
<main style={{ 
  position: "relative", 
  minHeight: "100vh", 
  overflow: "hidden",
  background: "linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite"
}}>
```

#### NFT Display Grid
```typescript
// Customize the NFT grid layout
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)', // Adjust columns
  gap: '20px',
  marginTop: '20px',
  marginBottom: '20px'
}}>
  {ownedNfts.map((nft, i) => (
    <RedeemControls 
      key={nft.id}
      mintAddress={nft.id}
      image={images[i]}
      metadata={nftsWithMetadata[i]}
    />
  ))}
</div>
```

## Step 5: Configure API Routes

### Update `pages/api/mint-hook.js`
```javascript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mintAddress } = req.body;
    
    // Your mint hook logic here
    console.log('Mint hook triggered for:', mintAddress);
    
    res.status(200).json({ success: true, mintAddress });
  } catch (error) {
    console.error('Mint hook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Update `pages/api/deposit-hook.js`
```javascript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mintAddress } = req.body;
    
    // Your deposit hook logic here
    console.log('Deposit hook triggered for:', mintAddress);
    
    res.status(200).json({ success: true, mintAddress });
  } catch (error) {
    console.error('Deposit hook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Step 6: Test the Application

### Start Development Server
```bash
# Start the development server
npm run dev

# The application should be available at http://localhost:3000
```

### Verify Functionality
1. **Wallet Connection**: Connect your Solana wallet
2. **Candy Machine Loading**: Verify Candy Machine data loads
3. **Minting**: Test minting an NFT
4. **NFT Display**: Check if owned NFTs appear
5. **Redemption**: Test NFT redemption functionality

## Step 7: Customize Styling

### Update `src/styles.ts`
```typescript
// Customize the collection name styling
export const CollectionName = styled.h1`
  font-family: 'Noto Sans', 'Helvetica', 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: var(--black-olive);
  margin-top: 16px;

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
    margin-top: 8px;
  }
`

// Customize the mint button
export const MintButtonStyle = styled(Button)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;
```

## Troubleshooting

### Common Issues

**"Module not found"**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**"Environment variables not loading"**
```bash
# Restart development server
# Ensure variables start with NEXT_PUBLIC_
# Check .env.local file location
```

**"Wallet connection issues"**
```bash
# Check browser console for errors
# Verify wallet extension is installed
# Check network configuration
```

### Verification Checklist

- [ ] Next.js configuration verified
- [ ] Environment variables properly set
- [ ] Application starts without errors
- [ ] Wallet connects successfully
- [ ] Candy Machine data loads
- [ ] Minting functionality works
- [ ] NFT display works correctly
- [ ] Styling appears as expected

## Next Steps

Once Next.js is configured and working:
- [Set up external services](./04-external-services.md)
- [Configure wallet connections](./05-wallet-connections.md)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Material-UI Documentation](https://mui.com/)
- [Styled Components](https://styled-components.com/) 