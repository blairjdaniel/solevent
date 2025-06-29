# ⭐ Starred Scripts

This directory contains important scripts that should be kept and maintained.

## **Scripts**

### **fund-escrow.js**
- **Purpose**: Fund the escrow PDA with SOL from local wallet
- **Usage**: `node fund-escrow.js`
- **Config**: Set `FUND_AMOUNT_SOL` variable to change amount
- **Last Updated**: 2024

### **calculate-escrow-pda.js**
- **Purpose**: Calculate and display the escrow PDA for the program
- **Usage**: `node calculate-escrow-pda.js`
- **Output**: Escrow PDA address and config snippet

### **check-escrow-balance.js**
- **Purpose**: Check SOL and token balances in escrow PDA
- **Usage**: `node check-escrow-balance.js`

## **Quick Commands**

```bash
# Fund escrow with 2 SOL
node scripts/starred/fund-escrow.js

# Check escrow PDA
node calculate-escrow-pda.js

# Check escrow balances
node scripts/starred/check-escrow-balance.js
```

## **Adding New Scripts**

To add a script to this starred collection:
1. Move the script to `scripts/starred/`
2. Update this README with description and usage
3. Test the script to ensure it works 