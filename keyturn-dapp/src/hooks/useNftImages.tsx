import { useEffect, useState } from "react";
import { getNftImageUrl } from "./utils";
import { useMemo } from "react";

export function useNftImages(nftList: { uri: string }[]) {
  const [images, setImages] = useState<(string | null)[]>([]);

  useEffect(() => {
    if (!nftList.length) return;
    (async () => {
      const urls = await Promise.all(
        nftList.map(nft => getNftImageUrl(nft.uri))
      );
      setImages(urls);
    })();
  }, [nftList]);

  return images;
}