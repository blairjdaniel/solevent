import { useCallback } from "react";
import { Nft } from "@metaplex-foundation/js";
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
import { logMintContext } from "./helpers/logs";
import { useMint } from "./hooks/useMint";
import { useOwnedCollectionNft } from "./hooks/useOwnedCollectionNft";
import { useNftImages } from "./hooks/useNftImages";
import { fetchNftMetadata } from "./hooks/utils";
import { collectionMintAddress, treasury, candyGuardAddress } from "./config";
import MintSuccessPopup from "./components/MintSuccessPopup";
import { useMintSuccessPopup } from "./hooks/useMintSuccessPopup";

export interface HomeProps {
  candyMachineId: string;
}

console.log('Collection Mint Address:', collectionMintAddress);

// Modern styled components for SolEvent
const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none;
`;

const ContentWrapper = styled.div`
  text-align: center;
  color: white;
  z-index: 1;
  max-width: 800px;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  font-weight: 300;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 2rem;
`;

const NFTCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const NFTImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const NFTTitle = styled.h3`
  color: white;
  margin: 0.5rem 0;
  font-size: 1.1rem;
`;

export default function Home({ candyMachineId }: HomeProps) {
  console.log("SolEvent Home mounted");
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
  }, [ownedNfts]);

  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <HeroSection>
        <BackgroundPattern />
        
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

        <ContentWrapper>
          <Title>BurrowBorn</Title>
          <Subtitle>Your Gateway to Solana NFT Minting</Subtitle>
          
          {!isReady ? (
            <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading mint info...</div>
          ) : (
            <>
              <MintButton
                onMint={startMint}
                candyMachine={candyMachineV3.candyMachine}
                isMinting={minting}
                walletConnected={!!wallet?.publicKey}
              />
              {minting && <div style={{ color: 'white', marginTop: '1rem' }}>Minting in progress...</div>}
              
              <StatsContainer>
                <StatCard>
                  <StatNumber>{ownedNfts.length}</StatNumber>
                  <StatLabel>Your NFTs</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{candyMachineV3.candyMachine?.items?.length || 0}</StatNumber>
                  <StatLabel>Total Supply</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{candyMachineV3.candyMachine?.items?.filter(item => item.minted).length || 0}</StatNumber>
                  <StatLabel>Minted</StatLabel>
                </StatCard>
              </StatsContainer>
              
              {ownedNfts.length > 0 && (
                <div>
                  <h2 style={{ color: 'white', marginBottom: '1rem' }}>Your Collection</h2>
                  <NFTGrid>
                    {ownedNfts.map((nft, i) => (
                      <NFTCard key={nft.id}>
                        <NFTImage 
                          src={images[i] || "/images/placeholder.png"} 
                          alt={`NFT ${i + 1}`}
                        />
                        <NFTTitle>{nft.content?.metadata?.name || `NFT #${i + 1}`}</NFTTitle>
                      </NFTCard>
                    ))}
                  </NFTGrid>
                </div>
              )}
            </>
          )}
        </ContentWrapper>
      </HeroSection>

      <Section>
        <Container>
          <Column>
            <Content>
              <Header>
                <CollectionName>BurrowBorn</CollectionName>
                <CollectionDescription>
                  A modern, out-of-the-box Solana Candy Machine minting dApp with beautiful UI and essential functionality.
                </CollectionDescription>
              </Header>
            </Content>
          </Column>
        </Container>
      </Section>

      <MintSuccessPopup
        isVisible={showSuccessPopup}
        onClose={closePopup}
        mintedNftId={mintedNftId}
      />
    </ErrorBoundary>
  );
}



