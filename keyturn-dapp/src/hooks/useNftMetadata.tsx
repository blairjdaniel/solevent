import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { findMetadataPda, Metaplex } from '@metaplex-foundation/js';

interface NftMetadataInfo {
  isMutable: boolean | null;
  updateAuthority: string | null;
  loading: boolean;
  error: string | null;
}

export function useNftMetadata(mintAddress: string | null): NftMetadataInfo {
  const { connection } = useConnection();
  const [metadataInfo, setMetadataInfo] = useState<NftMetadataInfo>({
    isMutable: null,
    updateAuthority: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!mintAddress) {
      setMetadataInfo({
        isMutable: null,
        updateAuthority: null,
        loading: false,
        error: null
      });
      return;
    }

    const checkMetadata = async () => {
      setMetadataInfo(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const mintPubkey = new PublicKey(mintAddress);
        const metaplex = new Metaplex(connection);
        
        console.log('Checking metadata for mint:', mintAddress);
        
        // Use Metaplex to fetch and parse metadata
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        
        console.log('Parsed NFT:', nft);
        console.log('NFT isMutable:', nft.isMutable);
        console.log('NFT updateAuthority:', nft.updateAuthorityAddress.toString());

        setMetadataInfo({
          isMutable: nft.isMutable,
          updateAuthority: nft.updateAuthorityAddress.toString(),
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error checking NFT metadata:', error);
        setMetadataInfo({
          isMutable: null,
          updateAuthority: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkMetadata();
  }, [mintAddress, connection]);

  return metadataInfo;
} 