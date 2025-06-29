// src/hooks/useCollectionNft.ts
import { useEffect, useState } from "react";
import { publicKey } from "@metaplex-foundation/umi";
import { findMetadataPda, fetchMetadata } from "@metaplex-foundation/mpl-token-metadata";

// Usage: Pass the collection NFT mint address to the hook
export function useCollectionNft(umi: any, mintAddress: string) {
  const [collectionNft, setCollectionNft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     console.log('🔍 useCollectionNft: mintAddress:', mintAddress);
     console.log('🔍 useCollectionNft: umi available:', !!umi);
    if (!umi || !mintAddress) {
      console.log('❌ useCollectionNft: Missing umi or mintAddress');
      setCollectionNft(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      let mint;
      try {
        mint = publicKey(mintAddress);
        console.log('✅ useCollectionNft: Valid mint address:', mint.toString());
      } catch (e) {
        console.error("❌ useCollectionNft: Invalid mint address:", mintAddress);
        console.error("❌ useCollectionNft: Error:", e);
        setCollectionNft(null);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 useCollectionNft: Finding metadata PDA...');
        const metadataPda = findMetadataPda(umi, { mint });
        console.log('📄 useCollectionNft: metadataPda:', metadataPda.toString());
        
        console.log('🔍 useCollectionNft: Fetching metadata...');
        const metadata = await fetchMetadata(umi, metadataPda);
        console.log("✅ useCollectionNft: Fetched metadata:", metadata);

        if (metadata && metadata.updateAuthority) {
          // Use the actual metadata without overriding the update authority
          setCollectionNft({ 
            mint, 
            metadata
          });
          console.log("✅ useCollectionNft: Collection NFT loaded successfully:", metadata.name);
        } else {
          console.log('❌ useCollectionNft: No metadata or update authority found');
          setCollectionNft(null);
        }
      } catch (e) {
        console.error('❌ useCollectionNft: Error fetching metadata:', e);
        console.error('❌ useCollectionNft: Error details:', e.message);
        console.error('❌ useCollectionNft: Error stack:', e.stack);
        setCollectionNft(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [umi, mintAddress]);

  return { collectionNft, loading };
}