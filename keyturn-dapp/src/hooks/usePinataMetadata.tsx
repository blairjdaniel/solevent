import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

interface MetadataAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: MetadataAttribute[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
  };
}

interface UsePinataMetadataReturn {
  uploadMetadata: (metadata: NFTMetadata) => Promise<string>;
  updateNFTMetadata: (mintAddress: string, originalMetadata: NFTMetadata) => Promise<{ uri: string; signature: string }>;
  isUploading: boolean;
  error: string | null;
}

export const usePinataMetadata = (): UsePinataMetadataReturn => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMetadata = useCallback(async (metadata: NFTMetadata): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      formData.append("file", blob, "metadata.json");

      const pinataApiUrl = process.env.NEXT_PUBLIC_PINATA_API_URL || "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const response = await fetch(pinataApiUrl, {
        method: "POST",
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
      }

      const data = await response.json();
      const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
      const uri = `${ipfsGateway}${data.IpfsHash}`;
      
      console.log('✅ Metadata uploaded to IPFS:', uri);
      return uri;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const updateNFTMetadata = useCallback(async (
    mintAddress: string, 
    originalMetadata: NFTMetadata
  ): Promise<{ uri: string; signature: string }> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Create updated metadata
      const updatedMetadata: NFTMetadata = {
        ...originalMetadata,
        attributes: originalMetadata.attributes.map(attr => 
          attr.trait_type === "Status" 
            ? { ...attr, value: "Redeemed" }
            : attr
        ),
        description: "This NFT has been redeemed and updated while in escrow.",
      };

      console.log('📝 Updated metadata:', updatedMetadata);

      // 2. Upload to Pinata/IPFS
      const newUri = await uploadMetadata(updatedMetadata);

      // 3. Call your escrow program to update on-chain metadata
      // This would integrate with your existing useRedeemProgram hook
      // For now, we'll return the URI and you can handle the on-chain update separately
      
      console.log('🎉 Metadata update process completed!');
      console.log('IPFS URI:', newUri);

      return { 
        uri: newUri, 
        signature: 'pending-on-chain-update' // You'll need to implement the actual on-chain call
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [publicKey, signTransaction, uploadMetadata]);

  return {
    uploadMetadata,
    updateNFTMetadata,
    isUploading,
    error,
  };
}; 