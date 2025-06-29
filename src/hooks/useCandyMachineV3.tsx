import React, { useState, useEffect, useCallback } from 'react';
import {
  generateSigner,
  transactionBuilder,
  publicKey,
  PublicKey,
  some,
} from '@metaplex-foundation/umi';
import { mintV2, fetchCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { treasury } from '../config';

/**
 * Custom hook to load Candy Machine v3 state and perform guarded mints
 */
export function useCandyMachineV3({
  umi,
  wallet,
  collectionNft,
  candyMachineId,
}: {
  umi: any;
  wallet: { publicKey: PublicKey | null };
  collectionNft?: { publicKey: string; metadata: { updateAuthority: string } };
  candyMachineId: string;
}) {
  // Loaded Candy Machine account
  const [candyMachine, setCandyMachine] = useState<any>(null);
  // PDA for Candy Guard
  const [candyGuard, setCandyGuard] = useState<PublicKey | null>(null);
  // Mint status
  const [status, setStatus] = useState<{ minting: boolean; error: any }>({ minting: false, error: null });

  // Load Candy Machine and derive guard PDA
  useEffect(() => {
    if (!umi || !candyMachineId) return;
    (async () => {
      try {
        // Fetch on-chain Candy Machine
        const machine = await fetchCandyMachine(umi, publicKey(candyMachineId));
        setCandyMachine(machine);

        // Use the mintAuthority from the candy machine as the candy guard
        if (machine.mintAuthority) {
          setCandyGuard(publicKey(machine.mintAuthority));
          console.log('Using mintAuthority as candy guard:', machine.mintAuthority);
        } else {
          console.log('No mintAuthority found on candy machine');
          setCandyGuard(null);
        }
      } catch (error) {
        setStatus((s) => ({ ...s, error }));
      }
    })();
  }, [umi, candyMachineId]);

  // Perform a mint through the guard
  const mint = useCallback(async () => {
    if (!candyMachine || !candyGuard) {
      throw new Error('Candy Machine or Candy Guard not ready');
    }
    if (!collectionNft?.metadata?.updateAuthority) {
      throw new Error('Collection metadata not loaded');
    }
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setStatus((s) => ({ ...s, minting: true, error: null }));
    try {
      const nftMint = generateSigner(umi);

      // Use the actual candyMachine properties
      const solPayment = some({ 
        destination: publicKey(treasury),
        value: 100000000 // 0.1 SOL in lamports
      });

      // Build the transaction first
      const transaction = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            candyGuard: candyGuard,
            mintArgs: {
              solPayment,
            },
          })
        );

      // Send and confirm with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          const result = await transaction.sendAndConfirm(umi);
          console.log('Mint transaction result:', result);
          
          // Return the minted NFT data
          const mintedItem = {
            mint: {
              address: nftMint.publicKey,
              publicKey: nftMint.publicKey,
            },
            transaction: result,
            candyMachine: candyMachine.publicKey,
          };
          
          setStatus((s) => ({ ...s, minting: false }));
          return [mintedItem]; // Return array to match expected format
        } catch (error: any) {
          retries--;
          if (error.message?.includes('disconnected port') || error.message?.includes('service worker')) {
            if (retries > 0) {
              console.log(`Wallet connection error, retrying... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              continue;
            }
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Mint error details:', error);
      setStatus((s) => ({ ...s, minting: false, error }));
      throw error;
    }
  }, [umi, wallet, candyMachine, candyGuard, collectionNft, treasury]);

  return { candyMachine, candyGuard, status, mint };
}

