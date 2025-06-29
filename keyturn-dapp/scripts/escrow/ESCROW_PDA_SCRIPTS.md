# SolEvent Escrow PDA Generation Scripts

This document provides an overview of the escrow PDA generation scripts in the `scripts/escrow/` directory.

## 🎯 Escrow PDA Scripts

### 1. **calculate-escrow-pda.js** - Basic Escrow PDA Calculator
- **Purpose**: Generates the basic escrow PDA for delegation
- **Key Features**:
  - Uses the escrow program ID to generate a PDA
  - Uses "escrow" as the seed for PDA generation
  - Provides the PDA address and bump for configuration
- **Environment Variables Used**:
  - `ESCROW_PROGRAM_ID` - Escrow program ID for PDA generation
- **Output**: 
  - Escrow PDA address
  - Bump value
  - Environment variable to add to .env.local
- **Relevance**: ⭐⭐⭐⭐⭐ Essential for basic escrow delegation

### 2. **calculate-candy-machine-escrow-pda.js** - Candy Machine Specific PDA Calculator
- **Purpose**: Generates an escrow PDA specific to a candy machine
- **Key Features**:
  - Uses candy machine ID as an additional seed
  - Creates a unique PDA for each candy machine
  - Provides candy machine specific escrow PDA
- **Environment Variables Used**:
  - `ESCROW_PROGRAM_ID` - Escrow program ID for PDA generation
  - `NEXT_PUBLIC_CANDY_MACHINE_ID` - Candy machine ID
- **Output**:
  - Candy machine specific escrow PDA address
  - Bump value
  - Environment variable to add to .env.local
- **Relevance**: ⭐⭐⭐⭐ Important for candy machine specific delegation

## 🔧 How to Use

### Step 1: Set Environment Variables
Add your escrow program ID to `.env.local`:
```bash
ESCROW_PROGRAM_ID=your_escrow_program_id_here
```

### Step 2: Generate Basic Escrow PDA
```bash
node scripts/escrow/calculate-escrow-pda.js
```

### Step 3: Generate Candy Machine Specific PDA (Optional)
If you have a candy machine, add its ID to `.env.local`:
```bash
NEXT_PUBLIC_CANDY_MACHINE_ID=your_candy_machine_id_here
```

Then run:
```bash
node scripts/escrow/calculate-candy-machine-escrow-pda.js
```

### Step 4: Add PDA to Environment
Copy the generated PDA address to your `.env.local`:
```bash
NEXT_PUBLIC_ESCROW_PDA=your_generated_escrow_pda_here
```

## 📋 Environment Variables Required

### Essential Variables:
- `ESCROW_PROGRAM_ID` - Your escrow program ID

### Optional Variables:
- `NEXT_PUBLIC_CANDY_MACHINE_ID` - Candy machine ID (for candy machine specific PDA)

### Generated Variables:
- `NEXT_PUBLIC_ESCROW_PDA` - The generated escrow PDA address

## 🔄 Script Updates Made

Both scripts have been updated to:
- ✅ Use environment variables instead of hardcoded program IDs
- ✅ Include helpful console output with emojis
- ✅ Provide clear instructions for adding to .env.local
- ✅ Follow consistent naming conventions

## 💡 Usage Scenarios

### Basic Escrow Delegation:
Use `calculate-escrow-pda.js` when you need a general escrow PDA for:
- NFT metadata delegation
- Collection authority delegation
- General escrow operations

### Candy Machine Specific Delegation:
Use `calculate-candy-machine-escrow-pda.js` when you need:
- Candy machine specific escrow PDA
- Unique PDA per candy machine
- Candy machine authority delegation

## 📝 Example Output

### Basic Escrow PDA:
```
🔧 Program ID: 5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7
🤝 Escrow PDA: 2ANVeQAjk3XyQpXvgzPH99AvPv2aUX6cCJWd5BQ2FACy
📊 Bump: 255

📋 Add this to your .env.local file:
NEXT_PUBLIC_ESCROW_PDA=2ANVeQAjk3XyQpXvgzPH99AvPv2aUX6cCJWd5BQ2FACy

💡 Use this escrow PDA as the update authority for your NFTs!
   This PDA can delegate authority for metadata updates.
```

### Candy Machine Specific PDA:
```
🍬 Candy Machine ID: 89avyPgbvVzcs33jZanMa9nF44vJTNpUZAuqYSvXTPX2
🔧 Program ID: 5vpFy9NT28rYYUX5rBX2RVDTh3pxNRDeyG463asMdos7
🤝 Escrow PDA: 3NJLdjXCAyAtbv8zs2WB5C4FMr6ywz5EKAc7wpS1o1KH
📊 Bump: 254

📋 Add this to your .env.local file:
NEXT_PUBLIC_ESCROW_PDA=3NJLdjXCAyAtbv8zs2WB5C4FMr6ywz5EKAc7wpS1o1KH

💡 This escrow PDA is unique to your Candy Machine!
   It can only be used with this specific Candy Machine ID.
   Use it as the update authority for your NFTs.
```

## 🚀 Next Steps

1. Run the appropriate script to generate your escrow PDA
2. Add the generated PDA to your `.env.local` file
3. Use the PDA in your delegation scripts and API endpoints
4. Test the delegation functionality with your NFTs 