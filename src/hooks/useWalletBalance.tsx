import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function useWalletBalance(connection: any, publicKey: any) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connection || !publicKey) return;
    (async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        setBalance(null);
      }
    })();
  }, [connection, publicKey]);

  return balance;
}