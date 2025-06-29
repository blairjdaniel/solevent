// src/components/NFTDetailNFTMetadata.tsx
import React from "react";
import { PublicKey } from "@solana/web3.js";

interface NFTDetailNFTMetadataProps {
  nft: any; // The full NFT object
  mintAddress: PublicKey;
  metadata: any; // The full metadata object
}

export const NFTDetailNFTMetadata: React.FC<NFTDetailNFTMetadataProps> = ({
  nft,
  mintAddress,
  metadata,
}) => {
  return (
    <div className="nft-metadata-container">
      {/* You can display more metadata fields here if you want */}
    </div>
  );
};