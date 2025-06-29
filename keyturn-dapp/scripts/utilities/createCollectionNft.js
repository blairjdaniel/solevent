import { Metaplex, keypairIdentity, toBigNumber } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, Keypair }    from '@solana/web3.js';
import fs from 'fs';


// Load your wallet
const secretKey = JSON.parse(fs.readFileSync('/Users/blairjdaniel/.config/solana/id.json'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

const connection = new Connection(clusterApiUrl('devnet'));
const metaplex   = Metaplex.make(connection).use(keypairIdentity(keypair));

// mint a **Master Edition** collection NFT
const { nft } = await metaplex.nfts().create({
  uri:                     'https://coffee-above-centipede-55.mypinata.cloud/ipfs/bafkreigpjlpewgvvstygnfnw6xlm5lwvsx5d2nccr2dpxtg4la2vyxekbe', 
  name:                    'Burrow Born NFT',
  symbol:                  'BBHOODS',
  sellerFeeBasisPoints:    500,
  isCollection:            true,
  maxSupply:               toBigNumber(100),        // <- MUST be a BigNumber
});

console.log('Collection Mint:', nft.address.toBase58());

