# Escrow PDA Delegation System

This system allows your escrow PDA to act as a delegate for metadata updates on NFTs from your collection, without needing private keys.

## How It Works

1. **Your wallet** (update authority) approves the escrow PDA as a collection delegate
2. **Escrow PDA** can then sign metadata update transactions using `invoke_signed`
3. **No private keys needed** - the PDA signs using program-derived seeds

## Delegation Flow

```
1. User mints NFT from Candy Machine
2. Your wallet approves escrow PDA as delegate (one-time per collection)
3. User calls redeem function
4. Escrow program updates NFT metadata using PDA signature
5. NFT is returned to user with updated metadata
```

## Scripts Available

### 1. Approve Escrow Delegate (Single Collection)
```bash
npm run approve-escrow-delegate
```
- Approves escrow PDA as delegate for the entire collection
- Only needs to be run once per collection
- Your wallet must be the update authority

### 2. Approve Escrow Delegate for New Mints
```bash
npm run approve-escrow-delegate-new-mints
```
- Finds new mints from your Candy Machine
- Checks if escrow PDA is already a delegate
- Approves delegation for new NFTs that need it
- Can be run periodically or after new mints

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
PROGRAM_ID=7jj6MeXvqZtqCHkbdmMUhbbQQn9FzKP8L72kzpV7x5LF
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=your_collection_mint_address
NEXT_PUBLIC_CANDY_MACHINE_ID=your_candy_machine_id
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
WALLET_KEYPAIR_PATH=/path/to/your/wallet.json
```

## Usage Scenarios

### Scenario 1: Initial Setup
1. Run `npm run approve-escrow-delegate` once
2. This approves the escrow PDA for the entire collection
3. All future NFTs in the collection can be updated by the escrow PDA

### Scenario 2: Monitoring New Mints
1. After new mints occur, run `npm run approve-escrow-delegate-new-mints`
2. Script will find new mints and approve delegation if needed
3. Can be automated with cron jobs or run manually

### Scenario 3: Manual Delegation
If you have specific NFT mint addresses that need delegation:
```javascript
// You can modify the scripts to target specific mints
const specificMint = new PublicKey('your_nft_mint_address');
```

## Technical Details

### Collection vs Individual Delegation
- **Collection Delegation**: Approves escrow PDA for entire collection (recommended)
- **Individual Delegation**: Approves escrow PDA for specific NFTs (more complex)

### PDA Signing
The escrow program uses `invoke_signed` to sign metadata updates:
```rust
invoke_signed(
    &update_metadata_accounts_v3(
        // ... metadata update instruction
    ),
    &[
        // ... account metas
    ],
    &[&[
        b"escrow",
        collection_mint.as_ref(),
        &[bump]
    ]]
)
```

### Security Considerations
- Only your wallet (update authority) can approve delegates
- Escrow PDA can only update metadata, not mint new NFTs
- Delegation can be revoked at any time by the update authority

## Troubleshooting

### Common Errors

1. **"Update authority does not match"**
   - Ensure your wallet is the update authority for the collection
   - Check that you're using the correct wallet keypair

2. **"Delegate already approved"**
   - This is normal - the script will skip already approved delegations

3. **"No metadata found"**
   - Ensure the mint address is valid and has metadata
   - Check that the NFT is part of your collection

### Debugging
- All scripts include detailed logging
- Check transaction signatures on Solana Explorer
- Verify PDA addresses match your escrow program

## Integration with Redeem Function

Once delegation is approved, your redeem instruction can update metadata:

```rust
// In your redeem instruction
let metadata_account = find_metadata_account(&mint);
let collection_delegate_record = find_collection_delegate_record(
    &collection_mint,
    &escrow_pda
);

invoke_signed(
    &update_metadata_accounts_v3(
        // ... your metadata update
    ),
    &[
        metadata_account.to_account_info(),
        collection_delegate_record.to_account_info(),
        // ... other accounts
    ],
    &[&[
        b"escrow",
        collection_mint.as_ref(),
        &[bump]
    ]]
)
```

## Next Steps

1. Run `npm run approve-escrow-delegate` to set up initial delegation
2. Test with a single NFT to ensure delegation works
3. Integrate metadata updates into your redeem instruction
4. Set up monitoring for new mints if needed 