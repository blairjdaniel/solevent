# Scripts Directory

This directory contains all utility scripts for the BurrowBorn NFT project, organized by category.

## 📁 Directory Structure

```
scripts/
├── candy-machine/     # Candy Machine management scripts
├── escrow/           # Escrow program scripts
├── testing/          # Test scripts
├── utilities/        # General utility scripts
├── starred/          # Frequently used scripts
└── archive/          # Archived scripts
```

## 🍬 Candy Machine Scripts

### `candy-machine/`
- **`check-candy-machine-authority.js`** - Check Candy Machine authority
- **`check-retain-authority.js`** - Check if retainAuthority is enabled
- **`close-candy-machine.js`** - Close a Candy Machine
- **`create-new-candy-machine.js`** - Create a new Candy Machine
- **`transfer-candy-machine-authority.js`** - Transfer Candy Machine authority
- **`transfer-candy-machine-authorities.js`** - Transfer multiple authorities
- **`transfer-candy-machine-mint-authority.js`** - Transfer mint authority
- **`withdraw-candy-machine.js`** - Withdraw funds from Candy Machine

## 🔒 Escrow Scripts

### `escrow/`
- **`calculate-escrow-pda.js`** - Calculate escrow PDA address
- **`create-escrow-ata.js`** - Create escrow associated token account
- **`mint-via-escrow.js`** - Mint NFTs through escrow program
- **`return-nft-from-escrow.js`** - Return NFTs from escrow

## 🧪 Testing Scripts

### `testing/`
- **`test-deposit-then-update.js`** - Test deposit and update flow
- **`test-escrow-different-wallet.js`** - Test escrow with different wallet
- **`test-escrow-return-only.js`** - Test escrow return functionality
- **`test-escrow-return.js`** - Test escrow return process
- **`test-escrow-test-wallet.js`** - Test escrow with test wallet
- **`test-escrow-transfer.js`** - Test escrow transfer functionality
- **`test-simple-update.js`** - Test simple metadata update
- **`testFetchNftMetadata.js`** - Test NFT metadata fetching

## 🛠️ Utility Scripts

### `utilities/`
- **`check-balances.js`** - Check wallet and account balances
- **`check-return-transaction.js`** - Check return transaction status
- **`check-transaction.js`** - Check transaction status
- **`check-update-authority.js`** - Check update authority
- **`convert-key.js`** - Convert key formats
- **`createCollectionNft.js`** - Create collection NFT
- **`generatePdas.js`** - Generate PDA addresses
- **`phantom-wallet-config.js`** - Configure Phantom wallet
- **`transfer-authority-simple.js`** - Simple authority transfer
- **`transfer-authority.js`** - Transfer authority
- **`update-metadata-complete.js`** - Complete metadata update
- **`update-metadata-uri.js`** - Update metadata URI

## ⭐ Starred Scripts (Frequently Used)

### `starred/`
- **`calculate-escrow-pda.js`** - Calculate escrow PDA
- **`check-escrow-balance.js`** - Check escrow balance
- **`fund-escrow.js`** - Fund escrow account
- **`testPinata.js`** - Test Pinata IPFS integration

## 🚀 Quick Start

### Most Common Commands:

```bash
# Check Candy Machine retain authority
node scripts/candy-machine/check-retain-authority.js

# Check escrow balance
node scripts/starred/check-escrow-balance.js

# Fund escrow
node scripts/starred/fund-escrow.js

# Calculate escrow PDA
node scripts/starred/calculate-escrow-pda.js
```

### Environment Setup:

Most scripts require these environment variables:
- `NEXT_PUBLIC_CANDY_MACHINE_ID`
- `NEXT_PUBLIC_COLLECTION_MINT_ADDRESS`
- `NEXT_PUBLIC_TREASURY`
- `NEXT_PUBLIC_HELIUS_RPC_URL`

### Running Scripts:

```bash
# From project root
node scripts/[category]/[script-name].js

# Example
node scripts/candy-machine/check-retain-authority.js
```

## 📝 Notes

- All scripts are configured for **devnet** by default
- Scripts use the Helius RPC endpoint when available
- Most scripts include error handling and logging
- Check individual script files for specific usage instructions

## 🔧 Maintenance

- Scripts are organized by functionality
- Frequently used scripts are in the `starred/` directory
- Old/unused scripts are moved to `archive/`
- Each script includes comments explaining its purpose 