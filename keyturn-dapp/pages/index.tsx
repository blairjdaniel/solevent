import React, { Suspense } from "react";
import Head from 'next/head';
import dynamic from "next/dynamic";

const DynamicMain = dynamic(() => import('../src/main'), {
  ssr: false,
  loading: () => <div style={{ padding: "20px", fontSize: "20px" }}>Loading...</div>
})

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>KeyTurn - Solana NFT Minting DApp</title>
        <meta name="description" content="A revolutionary NFT collection on Solana. Mint your KeyTurn NFTs today!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="KeyTurn - Solana NFT Minting DApp" />
        <meta property="og:description" content="A revolutionary NFT collection on Solana. Mint your KeyTurn NFTs today!" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KeyTurn - Solana NFT Minting DApp" />
        <meta name="twitter:description" content="A revolutionary NFT collection on Solana. Mint your KeyTurn NFTs today!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DynamicMain />
    </>
  );
}
