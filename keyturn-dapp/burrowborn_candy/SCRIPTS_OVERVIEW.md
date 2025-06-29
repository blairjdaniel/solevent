# SolEvent Candy Machine Scripts Overview

This document provides an overview of all JavaScript scripts in the burrowborn_candy folder, their purposes, and relevance to the SolEvent project.

## 🎯 Core Scripts (Most Relevant)

### 1. **mint-open-edition.js**
- **Purpose**: Creates and mints open edition NFTs for the SolEvent collection
- **Key Features**: 
  - Creates unlimited supply NFTs
  - Sets escrow PDA as update authority
  - Integrates with collection
- **Relevance**: ⭐⭐⭐⭐⭐ Essential for creating event access tokens

### 2. **mint-metaplex-nft.js**
- **Purpose**: Creates individual NFTs for the SolEvent collection
- **Key Features**:
  - Creates limited edition NFTs
  - Sets up collection structure
  - Configures metadata
- **Relevance**: ⭐⭐⭐⭐⭐ Essential for creating unique event NFTs

### 3. **check-collection-authority.js**
- **Purpose**: Verifies collection authority settings
- **Key Features**:
  - Checks if escrow PDA has collection authority
  - Validates collection configuration
- **Relevance**: ⭐⭐⭐⭐ Important for debugging collection issues

### 4. **update-collection-authority.js**
- **Purpose**: Transfers collection authority to escrow PDA
- **Key Features**:
  - Updates collection update authority
  - Enables escrow program control
- **Relevance**: ⭐⭐⭐⭐ Important for escrow functionality

## 🔧 Setup Scripts (Important for Configuration)

### 5. **transfer-candy-machine-authority-to-escrow.js**
- **Purpose**: Transfers candy machine authority to escrow PDA
- **Key Features**:
  - Enables escrow program to control minting
  - Secures candy machine operations
- **Relevance**: ⭐⭐⭐⭐ Critical for escrow integration

### 6. **set-collection-delegate-simple.js**
- **Purpose**: Sets escrow as collection delegate (simple method)
- **Key Features**:
  - Approves escrow as collection authority
  - Enables collection management
- **Relevance**: ⭐⭐⭐ Important for collection management

### 7. **set-collection-delegate.js**
- **Purpose**: Sets escrow as collection delegate (advanced method)
- **Key Features**:
  - Uses metadata delegate records
  - More comprehensive delegation
- **Relevance**: ⭐⭐⭐ Important for advanced collection management

## 🛡️ Guard and Security Scripts

### 8. **mint-with-escrow-guard.js**
- **Purpose**: Demonstrates minting with third-party signer guard
- **Key Features**:
  - Shows how escrow PDA signs transactions
  - Implements security guards
- **Relevance**: ⭐⭐⭐ Important for understanding security

### 9. **mint-via-escrow-program.js**
- **Purpose**: Mints NFTs through the escrow program
- **Key Features**:
  - Uses Anchor program for minting
  - Implements third-party signer guard
- **Relevance**: ⭐⭐⭐ Important for escrow program integration

### 10. **update-guard-authority.js**
- **Purpose**: Updates candy guard authority
- **Key Features**:
  - Transfers guard authority to escrow
  - Provides setup instructions
- **Relevance**: ⭐⭐ Useful for guard configuration

## 🔍 Utility Scripts

### 11. **check-retain-authority.js**
- **Purpose**: Checks candy machine retain authority setting
- **Key Features**:
  - Verifies if candy machine can be updated
  - Shows candy machine details
- **Relevance**: ⭐⭐ Useful for debugging

## 📋 Environment Variables Required

All scripts now use environment variables. See `env.example` for the complete list of required variables:

### Essential Variables:
- `NEXT_PUBLIC_SOLANA_RPC_HOST` - Solana RPC endpoint
- `WALLET_PATH` - Path to wallet keypair file
- `NEXT_PUBLIC_COLLECTION_MINT_ADDRESS` - Collection NFT address
- `NEXT_PUBLIC_CANDY_MACHINE_ID` - Candy machine address
- `NEXT_PUBLIC_ESCROW_PDA` - Escrow program PDA
- `ESCROW_PROGRAM_ID` - Escrow program ID

### Optional Variables:
- `NEXT_PUBLIC_CANDY_GUARD_ADDRESS` - Candy guard address
- `PINATA_JWT_TOKEN` - Pinata JWT for IPFS uploads
- `COLLECTION_IMAGE_URI` - Collection image URI
- `OPEN_EDITION_IMAGE_URI` - Open edition image URI

## 🚀 Recommended Usage Order

1. **Setup Phase**:
   - Run `check-collection-authority.js` to verify current state
   - Run `update-collection-authority.js` to transfer authority
   - Run `transfer-candy-machine-authority-to-escrow.js` to secure candy machine
   - Run `set-collection-delegate.js` to enable collection management

2. **Creation Phase**:
   - Run `mint-metaplex-nft.js` to create collection NFTs
   - Run `mint-open-edition.js` to create open edition NFTs

3. **Testing Phase**:
   - Run `mint-via-escrow-program.js` to test escrow integration
   - Run `check-retain-authority.js` to verify permissions

## 🔄 Script Updates Made

All scripts have been updated to:
- ✅ Use environment variables instead of hardcoded values
- ✅ Replace "Burrow Born" references with "SolEvent"
- ✅ Use generic variable names
- ✅ Include fallback values for development
- ✅ Follow consistent naming conventions

## 📝 Notes

- All scripts are now generic and reusable for any SolEvent project
- Environment variables provide flexibility for different deployments
- Scripts include helpful error messages and logging
- Most scripts include fallback values for development environments 