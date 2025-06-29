import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState, useRef } from "react";
import { MintButton } from "./components/MintButton";
import {
  Section,
  Container,
  Column,
  Header,
  WalletContainer,
  Wallet,
  WalletAmount,
  ConnectButton,
  ConnectWallet,
  Content,
  CollectionName,
  CollectionDescription,
  MintButtonStyle
} from "./styles";
import { AlertState } from "./utils";
import { useCandyMachineV3 } from "./hooks/useCandyMachineV3";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/noto-sans/900.css";
import { createUmi as baseCreateUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { publicKey } from '@metaplex-foundation/umi';
import { clusterApiUrl } from "@solana/web3.js";
import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
import ErrorBoundary from "./helpers/ErrorBoundary";
import styled from "styled-components";
import { useUmi } from "./hooks/useUmi";
import { useCollectionNft } from "./hooks/useCollectionNft";
import { useWalletBalance } from "./hooks/useWalletBalance";

import { CollectionImage } from "./components/CollectionImage";
import { logMintContext } from "./helpers/logs";
import { useMint } from "./hooks/useMint";
import { log } from "console";

import { NFTDetailImageMetadata } from "./components/NFTDetailImageMetadata";
import { NFTDetailNFTMetadata } from "./components/NFTDetailNFTMetadata";
import { useOwnedCollectionNft } from "./hooks/useOwnedCollectionNft";
import { useNftImages } from "./hooks/useNftImages";
import { fetchNftMetadata } from "./hooks/utils";
import { RedeemControls } from "./components/RedeemControls";
import { collectionMintAddress, treasury, candyGuardAddress, COLLECTION_NAME, COLLECTION_DESCRIPTION } from "./config";
import MintSuccessPopup from "./components/MintSuccessPopup";
import { useMintSuccessPopup } from "./hooks/useMintSuccessPopup";

export interface HomeProps {
  candyMachineId: string;
}

console.log('Collection Mint Address:', collectionMintAddress);

// Styled components for candy guard info
const CandyGuardInfo = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  color: white;
`;

const PaymentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const PaymentLabel = styled.span`
  font-weight: 600;
  color: #ffd700;
`;

const PaymentValue = styled.span`
  color: #00ff88;
`;

export default function Home({ candyMachineId }: HomeProps) {
  console.log("Home mounted");
  const { connection } = useConnection();
  const wallet = useWallet();
  const umi = useUmi(wallet);
  const { collectionNft, loading: collectionLoading } = useCollectionNft(umi, collectionMintAddress);
  const balance = useWalletBalance(connection, wallet.publicKey);
  
  const [alertState, setAlertState] = useState<AlertState | undefined>(undefined);
  
  const candyMachineV3 = useCandyMachineV3({ 
    umi, 
    wallet: { publicKey: wallet.publicKey ? publicKey(wallet.publicKey.toBase58()) : null }, 
    collectionNft, 
    candyMachineId 
  });
  
  // Use the mint hook which includes ownedNfts
  const { startMint, minting, error, mintedItems, ownedNfts } = useMint({
    candyMachineV3,
    collectionNft,
    setAlertState,
    walletPublicKey: wallet.publicKey?.toString() || "",
    collectionMint: collectionMintAddress,
  });

  // Use the same ownedNfts from mint hook for images
  const nftUris = useMemo(() => ownedNfts.map(nft => ({ uri: nft.content?.json_uri || nft.uri })), [ownedNfts]);
  const images = useNftImages(nftUris);
  const [nftsWithMetadata, setNftsWithMetadata] = useState([]);
  
  console.log("wallet?.publicKey:", wallet?.publicKey);
  console.log("candyMachineV3.candyMachine:", candyMachineV3.candyMachine);
  console.log("collectionNft:", collectionNft);
  console.log("collectionNft.metadata?.updateAuthority:", collectionNft?.metadata?.updateAuthority);
  console.log("collectionMintAddress:", collectionMintAddress);
  console.log("collectionLoading:", collectionLoading);
 
  console.log("treasury:", treasury);
  console.log("candyGuardAddress:", candyGuardAddress);

  // Debug each condition separately
  console.log("🔍 Debugging isReady conditions:");
  console.log("  wallet?.publicKey:", !!wallet?.publicKey, wallet?.publicKey?.toBase58());
  console.log("  candyMachineV3.candyMachine:", !!candyMachineV3.candyMachine);
  console.log("  collectionNft:", !!collectionNft);
  console.log("  collectionNft.metadata?.updateAuthority:", !!collectionNft?.metadata?.updateAuthority);
  console.log("  collectionLoading:", collectionLoading);
  
  const isReady =
  !!wallet?.publicKey &&
  !!candyMachineV3.candyMachine &&
  !!collectionNft &&
  !!collectionNft.metadata?.updateAuthority &&
  !collectionLoading;
  console.log("isReady:", isReady);
  console.log("NFT images:", images);
  console.log("ownedNfts:", ownedNfts);
  console.log("nftsWithMetadata:", nftsWithMetadata);

  useEffect(() => {
    logMintContext(wallet, candyMachineV3, umi);
  });

  // Use the mint success popup hook
  const { showSuccessPopup, mintedNftId, closePopup } = useMintSuccessPopup({
    minting,
    mintedItems,
    ownedNfts
  });

  console.log("ownedNfts:", ownedNfts);

  useEffect(() => {
    if (!ownedNfts.length) return;
    (async () => {
      const result = await Promise.all(
        ownedNfts.map(nft => fetchNftMetadata(nft.content?.json_uri || nft.uri))
      );
      console.log("Fetched all NFT metadata:", result);
      setNftsWithMetadata(result);
    })();
  }, [ownedNfts]); // Remove refreshTrigger dependency since useMint handles refresh

  return (
    <main style={{ 
      position: "relative", 
      minHeight: "100vh", 
      overflow: "hidden",
      background: "linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)",
      backgroundSize: "400% 400%",
      animation: "gradient 15s ease infinite"
    }}>
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      
      <Header>
        <WalletContainer>
          <Wallet>
            {wallet ? (
              <WalletAmount>
                {(balance || 0).toLocaleString()} SOL
                <ConnectButton />
              </WalletAmount>
            ) : (
              <ConnectButton>Connect Wallet</ConnectButton>
            )}
          </Wallet>
        </WalletContainer>
      </Header>

      <Section>
        <Container>
          <Column>
            <Content>
              <CollectionName>{COLLECTION_NAME}</CollectionName>
              <CollectionDescription>
                {COLLECTION_DESCRIPTION}
              </CollectionDescription>
            </Content>
            
            {!isReady ? (
              <div>Loading mint info...</div>
            ) : (
              <>
                <MintButton
                  onMint={startMint}
                  candyMachine={candyMachineV3.candyMachine}
                  isMinting={minting}
                  walletConnected={!!wallet?.publicKey}
                />
                {minting && <div>Minting in progress...</div>}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '20px',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}>
                  {ownedNfts.map((nft, i) => (
                    <RedeemControls 
                      key={nft.id}
                      mintAddress={nft.id}
                      image={images[i]}
                      metadata={nftsWithMetadata[i]}
                    />
                  ))}
                </div>
                {ownedNfts.map((nft, i) => (
                  <div key={nft.id}>
                    <NFTDetailNFTMetadata
                      nft={nft}
                      mintAddress={new PublicKey(nft.id)}
                      metadata={nftsWithMetadata[i]}
                    />
                  </div>
                ))}
              </>
            )}
          </Column>
        </Container>
      </Section>
      
      <MintSuccessPopup
        isVisible={showSuccessPopup}
        onClose={closePopup}
        mintedNftId={mintedNftId}
      />
    </main>
  );
}



