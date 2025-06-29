import React from 'react';

interface DebugInfoProps {
  walletAddress?: string;
  candyMachine?: any;
  collectionNft?: any;
}

export function DebugInfo({ walletAddress, candyMachine, collectionNft }: DebugInfoProps) {
  const candyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID || 'Not set';
  const collectionMintAddress = process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS || 'Not set';
  const treasury = process.env.NEXT_PUBLIC_TREASURY || 'Not set';
  
  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      padding: '15px', 
      borderRadius: '8px', 
      margin: '10px 0',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Debug Information</h4>
      
      <div><strong>Wallet:</strong> {walletAddress || 'Not connected'}</div>
      <div><strong>Candy Machine ID:</strong> {candyMachineId}</div>
      <div><strong>Collection Mint:</strong> {collectionMintAddress}</div>
      <div><strong>Treasury:</strong> {treasury}</div>
      
      {candyMachine && (
        <div style={{ marginTop: '10px' }}>
          <strong>Candy Machine Data:</strong>
          <pre style={{ fontSize: '10px', margin: '5px 0' }}>
            {JSON.stringify(candyMachine, null, 2)}
          </pre>
        </div>
      )}
      
      {collectionNft && (
        <div style={{ marginTop: '10px' }}>
          <strong>Collection NFT:</strong>
          <pre style={{ fontSize: '10px', margin: '5px 0' }}>
            {JSON.stringify(collectionNft, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 