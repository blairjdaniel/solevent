const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');

async function transferAuthority() {
  // Load your wallet
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('/Users/blairjdaniel/.config/solana/id.json', 'utf8')))
  );

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  const CANDY_MACHINE_ID = new PublicKey("89avyPgbvVzcs33jZanMa9nF44vJTNpUZAuqYSvXTPX2");
  const ESCROW_PDA = new PublicKey("2ANVeQAjk3XyQpXvgzPH99AvPv2aUX6cCJWd5BQ2FACy");

  console.log("🔧 Transferring Candy Machine authority...");
  console.log("Creator:", walletKeypair.publicKey.toString());
  console.log("Escrow PDA:", ESCROW_PDA.toString());
  console.log("Candy Machine:", CANDY_MACHINE_ID.toString());

  try {
    // Transfer the authority
    const { response } = await metaplex.candyMachines().update({
      candyMachine: CANDY_MACHINE_ID,
      authority: ESCROW_PDA,
    });

    console.log("✅ Authority transferred successfully!");
    console.log("Transaction signature:", response.signature);
    
  } catch (error) {
    console.error("❌ Error transferring authority:", error);
  }
}

transferAuthority(); 