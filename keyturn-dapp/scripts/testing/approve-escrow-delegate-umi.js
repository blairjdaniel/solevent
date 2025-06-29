// scripts/approve-escrow-delegate.js
import { createUmi, publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import {
  delegateAuthorityItemV1,
  TokenStandard
} from "@metaplex-foundation/mpl-token-metadata";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// 1) Load your update-authority wallet
const wallet = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(fs.readFileSync(process.env.WALLET_KEYPAIR_PATH, "utf8")))
);

// 2) Escrow PDA (the delegate)
const escrowPda = publicKey(process.env.ESCROW_PDA);

// 3) Build UMI with your wallet identity
const umi = createUmi(process.env.RPC_ENDPOINT)
  .use(keypairIdentity(wallet));

// 4) Mint address you want to grant isMutable-toggle rights for
const mint = publicKey("7iDR81SRkTTMMD3VeCrud2gGzRnmq9pGsySqP5zgnjn8");

(async () => {
  console.log("Approving Authority Item delegate for", mint.toBase58());

  const { signature } = await delegateAuthorityItemV1(umi, {
    mint,
    authority:       publicKey(wallet.publicKey.toString()), // the NFT’s current updateAuthority
    delegate:        escrowPda,                              // your PDA
    tokenStandard:   TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  console.log("✅ Delegate created:", signature);
})();
