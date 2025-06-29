const { Connection, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

async function checkUpdateAuthority(mintAddress) {
  const connection = new Connection('https://api.devnet.solana.com');
  const metaplex = Metaplex.make(connection);
  
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
    
    console.log('NFT Details:');
    console.log('Name:', nft.name);
    console.log('Update Authority:', nft.updateAuthorityAddress.toBase58());
    console.log('Mint Address:', nft.address.toBase58());
    
    // Check if it matches our escrow PDA
    const escrowPda = '6pUcT5rsBqn9evpfReMrsFQQYcG9Ks13dEkJw6HTED6c';
    if (nft.updateAuthorityAddress.toBase58() === escrowPda) {
      console.log('✅ Update authority is the escrow PDA!');
    } else {
      console.log('❌ Update authority is NOT the escrow PDA');
      console.log('Expected:', escrowPda);
      console.log('Actual:', nft.updateAuthorityAddress.toBase58());
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get mint address from command line
const mintAddress = process.argv[2];
if (!mintAddress) {
  console.log('Usage: node check-update-authority.js <MINT_ADDRESS>');
  process.exit(1);
}

checkUpdateAuthority(mintAddress); 