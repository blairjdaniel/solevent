import { useMemo } from "react";
import { clusterApiUrl, Cluster } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';


export function useUmi(wallet: any, network: Cluster = "devnet") {
  return useMemo(() => {
    try {
      const umi = createUmi(clusterApiUrl(network))
        .use(walletAdapterIdentity(wallet));
      umi.use(mplCandyMachine());
     
      return umi;
    } catch (error) {
      console.warn('Failed to create UMI instance:', error);
      // Return a fallback UMI instance
      return createUmi(clusterApiUrl(network)).use(mplCandyMachine());
    }
  }, [wallet, network]);
}
