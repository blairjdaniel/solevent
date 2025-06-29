# 5. Wallet Connections and Umi Integration

This guide covers setting up wallet connections and integrating with Metaplex Umi for Solana interactions.

## Prerequisites

- Next.js application configured
- External services set up
- Solana wallet extension installed (Phantom recommended)

## Step 1: Configure Wallet Adapters

### Install Required Dependencies
```bash
# Install wallet adapter packages
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom @solana/wallet-adapter-wallets

# Install Umi packages
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi-signer-wallet-adapters @metaplex-foundation/mpl-candy-machine @metaplex-foundation/mpl-core
```

### Configure Wallet Providers
Update `src/main.tsx`:

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

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

const theme = createTheme({ palette: { mode: "dark" } })

const Main = () => {
  const endpoint = useMemo(() => rpcHost, []);

  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add more wallet adapters as needed
    ],
    []
  );

  // Add global error handler
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

## Step 2: Set Up Umi Integration

### Create Umi Hook
Create `src/hooks/useUmi.tsx`:

```typescript
import { useMemo } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { useWallet } from '@solana/wallet-adapter-react';
import { rpcHost } from '../config';

export function useUmi(wallet: any) {
  const umi = useMemo(() => {
    const umiInstance = createUmi(rpcHost);
    
    if (wallet?.publicKey) {
      umiInstance.use(walletAdapterIdentity(wallet));
    }
    
    return umiInstance;
  }, [wallet?.publicKey]);

  return umi;
}
```

### Configure Candy Machine Hook
Update `src/hooks/useCandyMachineV3.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { useUmi } from './useUmi';

interface UseCandyMachineV3Props {
  umi: any;
  wallet: { publicKey: string | null };
  collectionNft: any;
  candyMachineId: string;
}

export function useCandyMachineV3({ umi, wallet, collectionNft, candyMachineId }: UseCandyMachineV3Props) {
  const [candyMachine, setCandyMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!umi || !candyMachineId) return;

    const fetchCandyMachineData = async () => {
      try {
        setLoading(true);
        const candyMachinePubkey = publicKey(candyMachineId);
        const candyMachineData = await fetchCandyMachine(umi, candyMachinePubkey);
        setCandyMachine(candyMachineData);
      } catch (err) {
        console.error('Error fetching candy machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCandyMachineData();
  }, [umi, candyMachineId]);

  return { candyMachine, loading, error };
}
```

## Step 3: Configure Wallet Connection Components

### Update Connect Button
Update `src/components/ConnectButton.tsx`:

```typescript
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styled from 'styled-components';

export const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
  
  &:hover {
    background-color: #f0f0f0 !important;
  }
`;

export default ConnectButton;
```

### Update Wallet Display
Update the wallet display in `src/Home.tsx`:

```typescript
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletBalance } from "./hooks/useWalletBalance";

// In your Home component
const { connection } = useConnection();
const wallet = useWallet();
const balance = useWalletBalance(connection, wallet.publicKey);

// In your JSX
<Header>
  <WalletContainer>
    <Wallet>
      {wallet ? (
        <WalletAmount>
          {(balance || 0).toLocaleString()} SOL
          <ConnectButton />
        </WalletAmount>
      ) : (
        <ConnectButton>Connect Wallet</ConnectButton>
      )}
    </Wallet>
  </WalletContainer>
</Header>
```

## Step 4: Set Up Wallet Balance Hook

### Create Wallet Balance Hook
Create `src/hooks/useWalletBalance.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function useWalletBalance(connection: any, publicKey: PublicKey | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connection || !publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Subscribe to balance changes
    const subscriptionId = connection.onAccountChange(publicKey, (accountInfo: any) => {
      setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey]);

  return balance;
}
```

## Step 5: Configure Minting with Umi

### Update Mint Hook
Update `src/hooks/useMint.tsx`:

```typescript
import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { publicKey } from '@metaplex-foundation/umi';
import { mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { useUmi } from './useUmi';

interface UseMintProps {
  candyMachineV3: any;
  collectionNft: any;
  setAlertState: (state: any) => void;
  walletPublicKey: string;
  collectionMint: string;
}

export function useMint({ candyMachineV3, collectionNft, setAlertState, walletPublicKey, collectionMint }: UseMintProps) {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedItems, setMintedItems] = useState<any[]>([]);
  const { connection } = useConnection();
  const wallet = useWallet();
  const umi = useUmi(wallet);

  const startMint = useCallback(async () => {
    if (!wallet.publicKey || !candyMachineV3.candyMachine) {
      setError('Wallet not connected or Candy Machine not loaded');
      return;
    }

    setMinting(true);
    setError(null);

    try {
      const candyMachinePubkey = publicKey(candyMachineV3.candyMachine.publicKey);
      
      const mintResult = await mintV2(umi, {
        candyMachine: candyMachinePubkey,
        collectionMint: publicKey(collectionMint),
        collectionUpdateAuthority: collectionNft.metadata.updateAuthority,
        mintArgs: {
          tokenStandard: candyMachineV3.candyMachine.tokenStandard,
        },
      });

      console.log('Mint successful:', mintResult);
      setMintedItems(prev => [...prev, mintResult]);
      
      setAlertState({
        open: true,
        message: 'NFT minted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Mint error:', err);
      setError(err instanceof Error ? err.message : 'Minting failed');
      
      setAlertState({
        open: true,
        message: 'Minting failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setMinting(false);
    }
  }, [wallet.publicKey, candyMachineV3, collectionMint, collectionNft, umi, setAlertState]);

  return { startMint, minting, error, mintedItems };
}
```

## Step 6: Test Wallet Connections

### Test Wallet Connection
```bash
# Start development server
npm run dev

# Open browser and navigate to http://localhost:3000
# Click "Connect Wallet" button
# Approve connection in wallet extension
```

### Verify Connection
Check the browser console for:
- Wallet public key
- Connection status
- Balance information

### Test Minting
1. Connect wallet
2. Wait for Candy Machine to load
3. Click "Mint" button
4. Approve transaction in wallet
5. Verify NFT appears in wallet

## Step 7: Handle Wallet Events

### Add Wallet Event Listeners
Update `src/Home.tsx`:

```typescript
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// In your Home component
const wallet = useWallet();

useEffect(() => {
  if (wallet.connected) {
    console.log('Wallet connected:', wallet.publicKey?.toBase58());
  } else {
    console.log('Wallet disconnected');
  }
}, [wallet.connected]);

useEffect(() => {
  if (wallet.wallet) {
    console.log('Wallet selected:', wallet.wallet.adapter.name);
  }
}, [wallet.wallet]);
```

## Troubleshooting

### Common Issues

**"Wallet not connecting"**
```bash
# Check wallet extension is installed
# Verify wallet is unlocked
# Check browser console for errors
# Try refreshing the page
```

**"Transaction failed"**
```bash
# Check wallet has sufficient SOL
# Verify network configuration
# Check transaction logs in wallet
# Review error messages in console
```

**"Umi initialization error"**
```bash
# Verify RPC endpoint is accessible
# Check network configuration
# Ensure wallet is connected before Umi operations
```

### Verification Checklist

- [ ] Wallet adapters installed and configured
- [ ] Umi integration working
- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Minting functionality works
- [ ] Transaction signing works
- [ ] Error handling implemented
- [ ] Wallet events handled properly

## Next Steps

Once wallet connections are working:
- [Connect everything together](./06-connecting-everything.md)
- [Test the complete application](./07-testing.md)

## Resources

- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Metaplex Umi Documentation](https://docs.metaplex.com/umi/)
- [Phantom Wallet](https://phantom.app/)
- [Solana Web3.js](https://docs.solana.com/developing/clients/javascript-api) 