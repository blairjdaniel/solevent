import { useEffect, useState } from "react";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

async function fetchNftsForWallet(walletPublicKey: string) {
  const response = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: walletPublicKey,
        page: 1,
        limit: 100,
      },
    }),
  });
  const data = await response.json();
  return data.result.items;
}

export function useOwnedCollectionNft(walletPublicKey: string | undefined, collectionMint: string, refresh = 0) {
  const [ownedNfts, setOwnedNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletPublicKey) {
      console.log('useOwnedCollectionNft: No wallet public key');
      return;
    }
    if (!collectionMint) {
      console.log('useOwnedCollectionNft: No collection mint address');
      return;
    }
    if (!HELIUS_API_KEY) {
      console.log('useOwnedCollectionNft: No Helius API key');
      return;
    }
    
    console.log('useOwnedCollectionNft: Fetching NFTs for wallet:', walletPublicKey);
    console.log('useOwnedCollectionNft: Collection mint:', collectionMint);
    console.log('useOwnedCollectionNft: Helius RPC URL:', HELIUS_RPC_URL);
    
    setLoading(true);
    (async () => {
      try {
        const nfts = await fetchNftsForWallet(walletPublicKey);
        console.log('useOwnedCollectionNft: Total NFTs found:', nfts.length);
        
        // Filter for your collection
        const collectionNfts = nfts.filter(
          (nft: any) => nft.grouping?.find((g: any) => g.group_value === collectionMint)
        );
        console.log('useOwnedCollectionNft: Collection NFTs found:', collectionNfts.length);
        console.log('useOwnedCollectionNft: Collection NFTs:', collectionNfts);
        setOwnedNfts(collectionNfts);
      } catch (e) {
        console.error('useOwnedCollectionNft: Error fetching NFTs:', e);
        setOwnedNfts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [walletPublicKey, collectionMint, refresh]);

  return { ownedNfts, loading };
}