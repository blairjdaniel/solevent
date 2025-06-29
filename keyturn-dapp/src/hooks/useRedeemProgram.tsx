import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findMetadataPda } from "@metaplex-foundation/js";

// Program ID from environment variable
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_REDEEM_PROGRAM_ID);

// PDA seed from environment variable
const REDEEM_PDA_SEED = process.env.NEXT_PUBLIC_REDEEM_PDA_SEED || "redeem";

// Instruction discriminators
const DEPOSIT_DISCRIMINATOR = Buffer.from([93, 226, 132, 166, 141, 9, 48, 101]);
const RETURN_DISCRIMINATOR = Buffer.from([224, 67, 212, 248, 72, 43, 233, 1]);
const UPDATE_METADATA_DISCRIMINATOR = Buffer.from([170, 182, 43, 239, 97, 78, 225, 186]);

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_METADATA_PROGRAM_ID || "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export function useRedeemProgram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  // Get redeem PDA (using configurable seed)
  const getRedeemPda = useCallback((): PublicKey => {
    const [redeemPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(REDEEM_PDA_SEED)],
      PROGRAM_ID
    );
    return redeemPda;
  }, []);

  // Get redeem token account for a specific mint
  const getRedeemTokenAccount = useCallback(async (mintAddress: string): Promise<PublicKey> => {
    const mintPubkey = new PublicKey(mintAddress);
    const redeemPda = getRedeemPda();
    return await getAssociatedTokenAddress(mintPubkey, redeemPda, true);
  }, [getRedeemPda]);

  // Get user's token account for a specific mint
  const getUserTokenAccount = useCallback(async (mintAddress: string): Promise<PublicKey> => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    const mintPubkey = new PublicKey(mintAddress);
    return await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);
  }, [wallet.publicKey]);

  // Check if NFT is in redeem
  const checkRedeemStatus = useCallback(async (mintAddress: string): Promise<{ inRedeem: boolean; userBalance: number; redeemBalance: number }> => {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const redeemTokenAccount = await getRedeemTokenAccount(mintAddress);
      const userTokenAccount = await getUserTokenAccount(mintAddress);

      const [redeemBalance, userBalance] = await Promise.all([
        connection.getTokenAccountBalance(redeemTokenAccount).catch(() => ({ value: { amount: '0' } })),
        connection.getTokenAccountBalance(userTokenAccount).catch(() => ({ value: { amount: '0' } }))
      ]);

      return {
        inRedeem: parseInt(redeemBalance.value.amount) > 0,
        userBalance: parseInt(userBalance.value.amount),
        redeemBalance: parseInt(redeemBalance.value.amount)
      };
    } catch (error) {
      console.error('Error checking redeem status:', error);
      return { inRedeem: false, userBalance: 0, redeemBalance: 0 };
    }
  }, [connection, getRedeemTokenAccount, getUserTokenAccount]);

  // Deposit NFT to redeem
  const depositNft = useCallback(async (mintAddress: string): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or doesn't support signing");
    }

    setLoading(true);
    setError(null);

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const redeemPda = getRedeemPda();
      const redeemTokenAccount = await getRedeemTokenAccount(mintAddress);
      const userTokenAccount = await getUserTokenAccount(mintAddress);

      console.log('🔐 Depositing NFT to redeem:', mintAddress);
      console.log('Note: Authority delegation will be handled by webhook system');

      // Create deposit instruction
      const depositInstruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: redeemTokenAccount, isSigner: false, isWritable: true },
          { pubkey: redeemPda, isSigner: false, isWritable: false },
          { pubkey: mintPubkey, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: DEPOSIT_DISCRIMINATOR
      });

      const transaction = new Transaction().add(depositInstruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Let the wallet adapter handle signing
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ NFT deposited to redeem successfully!');
      console.log('Transaction signature:', signature);
      console.log('💡 The webhook will automatically delegate authority to the redeem PDA');
      
      return signature;
    } catch (error: any) {
      console.error('Error depositing NFT:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, getRedeemPda, getRedeemTokenAccount, getUserTokenAccount]);

  // Return NFT from redeem
  const returnNft = useCallback(async (mintAddress: string): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or doesn't support signing");
    }

    setLoading(true);
    setError(null);

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const redeemPda = getRedeemPda();
      const redeemTokenAccount = await getRedeemTokenAccount(mintAddress);
      const userTokenAccount = await getUserTokenAccount(mintAddress);

      // Create return instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: redeemTokenAccount, isSigner: false, isWritable: true },
          { pubkey: redeemPda, isSigner: false, isWritable: false },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: mintPubkey, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: RETURN_DISCRIMINATOR
      });

      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Let the wallet adapter handle signing
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ NFT returned from redeem successfully!');
      console.log('Transaction signature:', signature);
      
      return signature;
    } catch (error: any) {
      console.error('Error returning NFT:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, getRedeemPda, getRedeemTokenAccount, getUserTokenAccount]);

  // Update metadata isMutable field to false (make immutable) using API
  const updateMetadata = useCallback(async (mintAddress: string): Promise<string | null> => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔒 Updating NFT to immutable via API...');
      console.log('Mint:', mintAddress);

      // Call the API endpoint that uses delegate-based update
      const response = await fetch('/api/update-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAddress: mintAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to update metadata');
      }

      console.log('✅ NFT updated to immutable successfully!');
      console.log('Transaction signature:', result.signature);
      
      return result.signature;
    } catch (error: any) {
      console.error('Error updating metadata:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  return {
    // State
    loading,
    error,
    
    // Address helpers
    getRedeemPda,
    getRedeemTokenAccount,
    getUserTokenAccount,
    
    // Status checking
    checkRedeemStatus,
    
    // Core operations
    depositNft,
    returnNft,
    updateMetadata,
    
    // Program info
    programId: PROGRAM_ID,
  };
} 