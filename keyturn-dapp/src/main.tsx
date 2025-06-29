import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import React from "react";
import { useMemo } from "react";
import Home from "./Home";
import { rpcHost, candyMachineId } from "./config";


const theme = createTheme({ palette: { mode: "dark" } })

const Main = () => {
  const endpoint = useMemo(() => rpcHost, []);

  // Add global error handler to suppress extension connection errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Could not establish connection') || 
          event.message.includes('Receiving end does not exist')) {
        // Suppress extension-related connection errors
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('Could not establish connection')) {
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

// const candyMachineId = new PublicKey(process.env.CANDY_MACHINE_ID);
 
 const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            
            <Home candyMachineId={candyMachineId.toBase58()} />   
          
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default Main;
