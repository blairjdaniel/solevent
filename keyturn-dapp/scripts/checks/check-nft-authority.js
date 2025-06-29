import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

// Configuration
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const MINT_ADDRESS = "7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8";
const WALLET_ADDRESS = "4g3XhRMs3npnmt5oqAg7KT2nN7cVKibjoLHXs5YHz59y";

async function checkNftAuthority() {
  try {
    console.log("🔍 Checking NFT update authority...");
    
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const metaplex = Metaplex.make(connection);
    
    const mint = new PublicKey(MINT_ADDRESS);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
    
    console.log("📋 NFT Details:");
    console.log("  Mint Address:", nft.address.toString());
    console.log("  Update Authority:", nft.updateAuthorityAddress.toString());
    console.log("  Is Mutable:", nft.isMutable);
    console.log("  Name:", nft.name);
    console.log("  Symbol:", nft.symbol);
    
    console.log("\n🔑 Authority Check:");
    console.log("  Your Wallet:", WALLET_ADDRESS);
    console.log("  NFT Update Authority:", nft.updateAuthorityAddress.toString());
    
    if (nft.updateAuthorityAddress.toString() === WALLET_ADDRESS) {
      console.log("✅ Your wallet IS the update authority!");
    } else {
      console.log("❌ Your wallet is NOT the update authority!");
      console.log("   You cannot create delegate records for this NFT.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkNftAuthority(); 