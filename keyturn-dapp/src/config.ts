import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, PublicKey, Cluster } from "@solana/web3.js";

// Solana Network Configuration
export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as Cluster;

export const rpcHost =
  process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl(NETWORK);

// Candy Machine Configuration
const candyMachineIdString = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
if (!candyMachineIdString) {
  throw new Error('NEXT_PUBLIC_CANDY_MACHINE_ID environment variable is required');
}

export const candyMachineId = new PublicKey(candyMachineIdString);

// Optional Configuration
export const collectionMintAddress = process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS;
export const treasury = process.env.NEXT_PUBLIC_TREASURY;
export const candyGuardAddress = process.env.NEXT_PUBLIC_CANDY_GUARD_ADDRESS;
export const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_PDA;

// Collection Configuration
export const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'SolEvent';
export const COLLECTION_DESCRIPTION = process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION || 'A revolutionary NFT collection on Solana.';

// Wallet Configuration
export const WALLET_KEYPAIR = process.env.WALLET_SECRET_KEY || "~/.config/solana/dev-wallet.json";

// Debug logging
console.log('🔧 SolEvent DApp Config loaded:');
console.log('  NETWORK:', NETWORK);
console.log('  rpcHost:', rpcHost);
console.log('  candyMachineId:', candyMachineId.toString());
console.log('  collectionMintAddress:', collectionMintAddress);
console.log('  treasury:', treasury);
console.log('  candyGuardAddress:', candyGuardAddress);
console.log('  escrowAddress:', escrowAddress);
console.log('  COLLECTION_NAME:', COLLECTION_NAME);
console.log('  COLLECTION_DESCRIPTION:', COLLECTION_DESCRIPTION);

// export const METADATA_URI = "https://coffee-above-centipede-55.mypinata.cloud/ipfs/bafkreiaoepsqe454m7rx6by5adeifecj6ar4odcj4fqine7z2wbd4xn7da"

