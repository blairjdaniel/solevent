import { useState, useCallback, useEffect } from "react";

import { useOwnedCollectionNft } from "../hooks/useOwnedCollectionNft";  

// Define NftType or import it from the appropriate module
type NftType = any; // Replace 'any' with the actual structure if known

interface UseMintProps {
  candyMachineV3: any;
  collectionNft: any;
  walletPublicKey: string;
  collectionMint: string;
  setAlertState?: (state: { open: boolean; message: string; severity: "error" | "success" }) => void;
}

export function useMint({ candyMachineV3, collectionNft, walletPublicKey, collectionMint, setAlertState }: UseMintProps) {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedItems, setMintedItems] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);
  const { ownedNfts, loading } = useOwnedCollectionNft(walletPublicKey, collectionMint, refresh);

  // Debug mintedItems changes
  useEffect(() => {
    console.log('🔄 useMint: mintedItems changed to:', mintedItems);
  }, [mintedItems]);

  // Auto-refresh ownedNfts after successful minting
  useEffect(() => {
    if (!minting && mintedItems && mintedItems.length > 0) {
      // Wait a bit for the blockchain to settle, then refresh
      const timer = setTimeout(() => {
        console.log('🔄 useMint: Triggering refresh after successful mint');
        setRefresh(prev => prev + 1);
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timer);
    }
  }, [minting, mintedItems]);

  const startMint = useCallback(async (quantity = 1) => {
    console.log("collectionNft:", collectionNft);
    console.log("collectionNft.metadata:", collectionNft?.metadata);
    console.log("collectionNft.metadata.updateAuthority:", collectionNft?.metadata?.updateAuthority);  
    console.log("startMint called");
    if (!candyMachineV3 || !candyMachineV3.mint) {
      console.log("Candy Machine not ready");
      return;
    }
    if (!collectionNft || !collectionNft.metadata?.updateAuthority) {
      console.log("Collection NFT or update authority not loaded");
      return;
    }
    console.log("About to call mint");
    try {
      setMinting(true);
      setMintedItems(null); // Reset mintedItems at start
      console.log("Calling candyMachineV3.mint...");
      const items = await candyMachineV3.mint(quantity);
      console.log("Mint successful, items received:", items);
      console.log("Setting mintedItems to:", items);
      setMintedItems(items);
      console.log("mintedItems state should now be set");

    } catch (e: any) {
      console.error("Mint error:", e);
      setError(e.message);
      setAlertState?.({ open: true, message: e.message, severity: "error" });
    } finally {
      console.log("Setting minting to false");
      setMinting(false);
    }
    console.log("Mint function finished");
  }, [candyMachineV3, collectionNft, setAlertState]);

  return { startMint, minting, error, mintedItems, ownedNfts, loading };
}