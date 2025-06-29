// src/components/NFTDetailImageMetadata.tsx
import React from "react";
import { PublicKey } from "@solana/web3.js";

interface NFTDetailImageMetadataProps {
  mintAddress: PublicKey;
  image: string;
}

export const NFTDetailImageMetadata: React.FC<NFTDetailImageMetadataProps> = ({
  mintAddress,
  image,
}) => {
  const imageUrl = image || "/images/placeholder.png";
  return (
    <div className="nft-image-container">
      <img
        src={imageUrl}
        alt={`NFT ${mintAddress.toBase58()}`}
        className="nft-image"
      />
    </div>
  );
};