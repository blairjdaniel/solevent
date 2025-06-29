# SolEvent API Endpoints Overview

This document provides an overview of the API endpoints in the `pages/api/` directory and their purposes for the SolEvent project.

## 🎯 API Endpoints

### 1. **mint-hook.js** - NFT Minting Webhook Handler
- **Purpose**: Handles webhook notifications when new NFTs are minted
- **Key Features**:
  - Processes webhook notifications from Helius, Shyft, and other providers
  - Automatically delegates newly minted NFTs to the escrow PDA
  - Saves webhook payloads to the `mints/` folder for tracking
  - Prevents duplicate processing of the same transaction
- **Environment Variables Used**:
  - `ESCROW_PROGRAM_ID` - Escrow program ID for PDA generation
  - `WALLET_SECRET_KEY_BASE58` - Wallet secret key for signing transactions
  - `NEXT_PUBLIC_SOLANA_RPC_HOST` - Solana RPC endpoint
- **Relevance**: ⭐⭐⭐⭐⭐ Essential for automatic NFT delegation

### 2. **deposit-hook.js** - NFT Deposit Webhook Handler
- **Purpose**: Handles webhook notifications when NFTs are deposited into escrow
- **Key Features**:
  - Processes deposit notifications from escrow programs
  - Updates NFT metadata to immutable status
  - Uses escrow PDA as delegate for metadata updates
  - Prevents duplicate processing of deposits
- **Environment Variables Used**:
  - `ESCROW_PROGRAM_ID` - Escrow program ID for PDA generation
  - `WALLET_SECRET_KEY_BASE58` - Wallet secret key for signing transactions
  - `NEXT_PUBLIC_SOLANA_RPC_HOST` - Solana RPC endpoint
- **Relevance**: ⭐⭐⭐⭐ Important for escrow functionality

### 3. **update-metadata.js** - Manual Metadata Update Endpoint
- **Purpose**: Provides a manual API endpoint for updating NFT metadata
- **Key Features**:
  - Allows manual updates to NFT metadata
  - Can make NFTs immutable
  - Uses wallet authority for updates
  - Provides detailed error handling for delegation issues
- **Environment Variables Used**:
  - `WALLET_SECRET_KEY_BASE58` - Wallet secret key for signing transactions
  - `NEXT_PUBLIC_SOLANA_RPC_HOST` - Solana RPC endpoint
  - `NEXT_PUBLIC_ESCROW_PDA` - Escrow PDA address
- **Relevance**: ⭐⭐⭐ Useful for manual metadata management

## 🔧 Webhook Integration

### Supported Webhook Providers:
1. **Helius** - Primary webhook provider
   - Format: `NFT_MINT` type with account, candyMachine, and signature
   - Parsed data format with mint address extraction
   - Account data format for complex payloads

2. **Shyft** - Fallback webhook provider
   - Format: `NFT_CREATED` type with account, mint, and signature
   - Compatible with various field naming conventions

### Webhook Payload Processing:
- **Automatic Detection**: Scripts automatically detect webhook format
- **Flexible Parsing**: Handles multiple payload structures
- **Error Handling**: Graceful handling of malformed payloads
- **Logging**: Comprehensive logging for debugging

## 🛡️ Security Features

### Duplicate Prevention:
- **Transaction Tracking**: Uses in-memory sets to track processed transactions
- **Signature Validation**: Validates transaction signatures
- **Address Validation**: Validates Solana public key formats

### Error Handling:
- **Graceful Degradation**: Continues processing even if some operations fail
- **Detailed Logging**: Comprehensive error messages and stack traces
- **Status Codes**: Proper HTTP status codes for different error types

## 📋 Environment Variables Required

### Essential Variables:
- `ESCROW_PROGRAM_ID` - Escrow program ID for PDA generation
- `WALLET_SECRET_KEY_BASE58` - Base58 encoded wallet secret key
- `NEXT_PUBLIC_SOLANA_RPC_HOST` - Solana RPC endpoint

### Optional Variables:
- `NEXT_PUBLIC_ESCROW_PDA` - Pre-calculated escrow PDA (for update-metadata.js)

## 🚀 Deployment Considerations

### Production Setup:
1. **Database**: Replace in-memory transaction tracking with database storage
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Authentication**: Add authentication for manual endpoints
4. **Monitoring**: Add monitoring and alerting for webhook failures

### Security Best Practices:
1. **Environment Variables**: Store sensitive data in environment variables
2. **HTTPS**: Use HTTPS for all webhook endpoints
3. **Validation**: Validate all incoming webhook payloads
4. **Logging**: Implement secure logging without exposing sensitive data

## 🔄 API Updates Made

All API endpoints have been updated to:
- ✅ Use environment variables instead of hardcoded values
- ✅ Include fallback values for development
- ✅ Follow consistent error handling patterns
- ✅ Use generic variable names
- ✅ Include comprehensive logging

## 📝 Usage Examples

### Setting up Webhooks:
1. Configure webhook URL in your webhook provider (Helius/Shyft)
2. Point to your deployed API endpoints:
   - `https://your-domain.com/api/mint-hook` for minting
   - `https://your-domain.com/api/deposit-hook` for deposits

### Manual Metadata Updates:
```bash
curl -X POST https://your-domain.com/api/update-metadata \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "your_nft_mint_address"}'
```

## 📊 Monitoring and Debugging

### Log Files:
- Webhook payloads are saved to `mints/` folder
- Console logs provide detailed processing information
- Error logs include stack traces and context

### Common Issues:
1. **Delegation Errors**: Ensure escrow PDA is properly set as delegate
2. **Webhook Format**: Verify webhook payload format matches expected structure
3. **Network Issues**: Check RPC endpoint connectivity
4. **Wallet Issues**: Verify wallet secret key format and permissions 