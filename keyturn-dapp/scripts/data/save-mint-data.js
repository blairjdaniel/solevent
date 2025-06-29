#!/usr/bin/env node

// Save the webhook data from the recent mint to mints folder
import fs from 'fs';
import path from 'path';

const mintData = {
  "timestamp": "2025-06-28T05-13-17-627Z",
  "mintAddress": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
  "signature": "5MdgpsHKhTTaqpD5pjmTiG7wbWZUBbGjJmoaZvNGXVVG6UHJ2up99t7hk2FXeMbQ5SKNXbwhABUPMfZv6prqe9QD",
  "buyer": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
  "amount": "0.11979666 SOL",
  "webhookPayload": {
    "accountData": [
      {
        "account": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
        "nativeBalanceChange": -119796660,
        "tokenBalanceChanges": []
      },
      {
        "account": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
        "nativeBalanceChange": 1461600,
        "tokenBalanceChanges": []
      },
      {
        "account": "2WixzkrXGxeDijWh2EuzVGkXhXSC2EydtkwLNxRqrce4",
        "nativeBalanceChange": 0,
        "tokenBalanceChanges": []
      },
      {
        "account": "6VeADrPj8z8V85W98UcjjxXWgSCMEVazvxag5iLAfQwK",
        "nativeBalanceChange": 0,
        "tokenBalanceChanges": []
      },
      {
        "account": "HYeNRwKXNbXrcFdNXE37YskNT4VrbWBg5rWpajPU3tmt",
        "nativeBalanceChange": 15115600,
        "tokenBalanceChanges": []
      },
      {
        "account": "CCLtJNin3QS7rtmejwSiEwjSoWyyg3WdqfJBPbDgSYAS",
        "nativeBalanceChange": 1030080,
        "tokenBalanceChanges": []
      },
      {
        "account": "Rq14jS2soTwBEza3YD4SveYk47ENCtEcWEtwqsutRUE",
        "nativeBalanceChange": 2039280,
        "tokenBalanceChanges": [
          {
            "mint": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
            "rawTokenAmount": {
              "decimals": 0,
              "tokenAmount": "1"
            },
            "tokenAccount": "Rq14jS2soTwBEza3YD4SveYk47ENCtEcWEtwqsutRUE",
            "userAccount": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC"
          }
        ]
      }
    ],
    "description": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC minted Burrow Born for 0.11979666 SOL on CANDY_MACHINE_V3.",
    "events": {
      "nft": {
        "amount": 119796660,
        "buyer": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
        "description": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC minted Burrow Born for 0.11979666 SOL on CANDY_MACHINE_V3.",
        "fee": 150100,
        "feePayer": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
        "nfts": [
          {
            "mint": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
            "tokenStandard": "NonFungible"
          }
        ],
        "saleType": "MINT",
        "seller": "",
        "signature": "5MdgpsHKhTTaqpD5pjmTiG7wbWZUBbGjJmoaZvNGXVVG6UHJ2up99t7hk2FXeMbQ5SKNXbwhABUPMfZv6prqe9QD",
        "slot": 390651428,
        "source": "CANDY_MACHINE_V3",
        "staker": "",
        "timestamp": 1751087595,
        "type": "NFT_MINT"
      },
      "setAuthority": [
        {
          "account": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
          "from": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
          "innerInstructionIndex": 11,
          "instructionIndex": 2,
          "to": "CCLtJNin3QS7rtmejwSiEwjSoWyyg3WdqfJBPbDgSYAS"
        },
        {
          "account": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
          "from": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
          "innerInstructionIndex": 12,
          "instructionIndex": 2,
          "to": "CCLtJNin3QS7rtmejwSiEwjSoWyyg3WdqfJBPbDgSYAS"
        }
      ]
    },
    "fee": 150100,
    "feePayer": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
    "signature": "5MdgpsHKhTTaqpD5pjmTiG7wbWZUBbGjJmoaZvNGXVVG6UHJ2up99t7hk2FXeMbQ5SKNXbwhABUPMfZv6prqe9QD",
    "slot": 390651428,
    "source": "CANDY_MACHINE_V3",
    "timestamp": 1751087595,
    "type": "NFT_MINT"
  },
  "extractedData": {
    "mintAddress": "8Zg1h3hdntMusLkjtnax6tXbaLUcLsjFCmTTCdLLP3kT",
    "signature": "5MdgpsHKhTTaqpD5pjmTiG7wbWZUBbGjJmoaZvNGXVVG6UHJ2up99t7hk2FXeMbQ5SKNXbwhABUPMfZv6prqe9QD",
    "buyer": "DwLpVTosjZVpk52Tb6xBfeUMF1oXT1qGGGSYJEMG2jZC",
    "delegateRecord": "CCLtJNin3QS7rtmejwSiEwjSoWyyg3WdqfJBPbDgSYAS"
  }
};

// Create mints folder if it doesn't exist
const mintsDir = path.join(process.cwd(), 'mints');
if (!fs.existsSync(mintsDir)) {
  fs.mkdirSync(mintsDir, { recursive: true });
  console.log('📁 Created mints folder');
}

// Create filename with timestamp and signature
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `${timestamp}_${mintData.signature}.json`;
const filepath = path.join(mintsDir, filename);

// Save to file
fs.writeFileSync(filepath, JSON.stringify(mintData, null, 2));
console.log(`💾 Saved mint data to: ${filepath}`);
console.log(`📋 NFT Mint Address: ${mintData.mintAddress}`);
console.log(`📝 Transaction Signature: ${mintData.signature}`);
console.log(`🔐 Delegate Record: ${mintData.extractedData.delegateRecord}`); 