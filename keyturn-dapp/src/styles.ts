import styled from 'styled-components';
import LinearProgress from '@mui/material/LinearProgress';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@mui/material';


export const MintButtonStyle = styled(Button)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;

export const Section = styled('div')<any>`
  width: calc(100% - 64px);
  height: calc(100vh - 192px);
  padding: 32px 0;

  @media only screen and (max-width: 768px) {
    height: auto;
    padding-top: 80px;
  }

  @media only screen and (max-width: 450px) {
    width:auto;
    padding: 16px 0;
  }
`
export const Container = styled('div')<any>`
  width: 100%;
  height: 100%;
  max-width: 1280px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 32px;
  display: flex;
  flex-direction: row;
  gap: 96px;
  
  @media only screen and (max-width: 1024px) {
    gap: 48px;
  }

  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }

  @media only screen and (max-width: 450px) {
    padding: 16px;
    width: auto;
  }
`;
export const Column = styled('div')<any>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 64px;
  width: 100%;
  height: 100%;

  @media only screen and (max-width: 450px) {
    gap: 32px;
  }
`;
export const MintCount = styled('h3')`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
`;
export const BorderLinearProgress = styled(LinearProgress)`
  height: 16px !important;
  border-radius: 30px;
  background-color: var(--alt-background-color) !important;
  > div.MuiLinearProgress-barColorPrimary{
    background-color: var(--primary) !important;
  }
  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-color: var(--primary);
  }
`;
export const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute; 
  width: 100%;
`;
export const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  margin: 30px;
  z-index: 999;
  position: relative;

//   .wallet-adapter-dropdown-list {
//     background: #ffffff;
//   }
//   .wallet-adapter-dropdown-list-item {
//     background: #000000;
//   }
//   .wallet-adapter-dropdown-list {
//     grid-row-gap: 5px;
//   }
// `;
export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
  width: 100%;
`
export const Other = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 48px;
  width: 100%;
`
export const CollectionName = styled.h1`
  font-family: 'Noto Sans', 'Helvetica', 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: var(--black-olive);
  margin-top: 16px;

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
    margin-top: 8px;
  }
`
export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 16px;
  flex-wrap: wrap;
`
export const InfoBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 8px;
  border: 2px solid #FFFFFF;
  border-radius: 4px;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);

  /* Uncomment below if you want responsive font size */
  /* 
  @media only screen and (max-width: 450px) {
    font-size: 18px;
  }
  */
`;

export const CollectionDescription = styled.p`
  font-weight: 400;
  font-size: 20px;
  line-height: 150%;
  color: var(--black-olive);
`

export const ProgressbarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
`
export const WalletAmount = styled.div`
  color: var(--white);
  width: auto;
  padding: 8px 8px 8px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 5px;
  background-color: var(--primary);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 600;
  line-height: 100%;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

export const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

export const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;
export const ConnectWallet = styled(WalletMultiButton)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 18px 24px;
  gap: 10px;
  width: 100%;
  height: fit-content;
  background-color: var(--primary) !important;
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white) !important;
  transition: 0.2s;
  :hover {
    background-color: var(--primary) !important;
    color: var(--white) !important;
    opacity: 0.9;
  }
`