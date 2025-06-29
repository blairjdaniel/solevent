import { useState, useEffect, useRef } from 'react';

interface UseMintSuccessPopupProps {
  minting: boolean;
  mintedItems: any;
  ownedNfts: any[];
}

export function useMintSuccessPopup({ minting, mintedItems, ownedNfts }: UseMintSuccessPopupProps) {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [mintedNftId, setMintedNftId] = useState<string | undefined>();
  const [pendingMints, setPendingMints] = useState<string[]>([]);
  
  // Use refs to track if we've already processed the initial load
  const hasProcessedInitialLoadRef = useRef(false);
  const initialOwnedNftsCountRef = useRef(0);
  const hasShownPopupForCurrentMintRef = useRef(false);
  const currentMintIdRef = useRef<string | null>(null);

  // Debug showSuccessPopup changes
  useEffect(() => {
    console.log('🎭 showSuccessPopup changed to:', showSuccessPopup);
  }, [showSuccessPopup]);

  // Debug MintSuccessPopup props
  useEffect(() => {
    console.log('🎬 MintSuccessPopup props:', { showSuccessPopup, mintedNftId });
  }, [showSuccessPopup, mintedNftId]);

  // Reset popup state when minting starts
  useEffect(() => {
    if (minting) {
      hasShownPopupForCurrentMintRef.current = false;
      currentMintIdRef.current = null;
      console.log('🔄 Minting started, reset popup state');
    }
  }, [minting]);

  // Show success popup when minting is successful
  useEffect(() => {
    console.log('🎯 Popup detection - minting:', minting, 'mintedItems:', mintedItems, 'showSuccessPopup:', showSuccessPopup);
    
    // Set initial count on first load
    if (!hasProcessedInitialLoadRef.current && ownedNfts.length > 0) {
      initialOwnedNftsCountRef.current = ownedNfts.length;
      hasProcessedInitialLoadRef.current = true;
      console.log('📊 Initial load: Found', ownedNfts.length, 'existing NFTs');
      return;
    }

    // Show popup immediately when minting completes successfully (but only once per mint)
    if (!minting && mintedItems && mintedItems.length > 0 && !showSuccessPopup) {
      console.log('🎯 Minting completed, checking if we should show popup');
      
      // Extract mint ID from the minted item
      const mintedItem = mintedItems[0]; // Get the first minted item
      let mintId = null;
      
      // Try different ways to extract the mint ID
      if (mintedItem.mint?.address) {
        mintId = typeof mintedItem.mint.address === 'string' 
          ? mintedItem.mint.address 
          : mintedItem.mint.address.toString();
      } else if (mintedItem.mint?.publicKey) {
        mintId = typeof mintedItem.mint.publicKey === 'string' 
          ? mintedItem.mint.publicKey 
          : mintedItem.mint.publicKey.toString();
      } else if (mintedItem.mint) {
        mintId = typeof mintedItem.mint === 'string' 
          ? mintedItem.mint 
          : mintedItem.mint.toString();
      }
      
      console.log('🎯 Extracted mint ID:', mintId);
      console.log('🎯 Current mint ID ref:', currentMintIdRef.current);
      console.log('🎯 Has shown popup for current mint:', hasShownPopupForCurrentMintRef.current);
      
      // Only show popup if we haven't shown it for this specific mint
      if (mintId && mintId !== currentMintIdRef.current && !hasShownPopupForCurrentMintRef.current) {
        setMintedNftId(mintId);
        setShowSuccessPopup(true);
        hasShownPopupForCurrentMintRef.current = true;
        currentMintIdRef.current = mintId;
        console.log('🎉 Success popup should now be visible with mint ID:', mintId);
        
        // Track this mint for webhook confirmation
        setPendingMints(prev => [...prev, mintId]);
      } else if (mintId) {
        console.log('🎯 Skipping popup - already shown for this mint or same mint ID');
      } else {
        console.log('⚠️ Could not extract mint ID from mintedItems:', mintedItems);
      }
    }
  }, [mintedItems, minting, ownedNfts.length, showSuccessPopup]);

  // Show popup when webhook confirms mint (ownedNfts increases)
  useEffect(() => {
    // Skip if we haven't processed initial load yet
    if (!hasProcessedInitialLoadRef.current) {
      return;
    }

    // Check if we have new NFTs that match our pending mints
    if (ownedNfts.length > initialOwnedNftsCountRef.current && !showSuccessPopup && pendingMints.length > 0) {
      console.log('🎉 Webhook confirmed new NFTs!');
      console.log('Current ownedNfts count:', ownedNfts.length);
      console.log('Previous count:', initialOwnedNftsCountRef.current);
      console.log('Pending mints:', pendingMints);
      
      // Get the most recently minted NFT
      const latestNft = ownedNfts[ownedNfts.length - 1];
      if (latestNft && !hasShownPopupForCurrentMintRef.current) {
        console.log('Latest NFT:', latestNft.id);
        setMintedNftId(latestNft.id);
        setShowSuccessPopup(true);
        hasShownPopupForCurrentMintRef.current = true;
        currentMintIdRef.current = latestNft.id;
        console.log('🎉 Success popup should now be visible');
        
        // Clear pending mints and update count
        setPendingMints([]);
        initialOwnedNftsCountRef.current = ownedNfts.length;
      }
    }
  }, [ownedNfts, showSuccessPopup, pendingMints]);

  const closePopup = () => {
    console.log('🔴 Closing popup');
    setShowSuccessPopup(false);
    setMintedNftId(undefined);
    setPendingMints([]);
    // Don't reset hasShownPopupForCurrentMintRef here - we want to prevent reappearing
  };

  return {
    showSuccessPopup,
    mintedNftId,
    closePopup
  };
} 