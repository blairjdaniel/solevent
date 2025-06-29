# 1. Getting Started - Git Clone and Initial Setup

This guide will walk you through the initial setup of the SolEvent DApp project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Solana CLI** (optional, for development)
- **A code editor** (VS Code recommended)

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/solvent-dapp.git

# Navigate to the project directory
cd solvent-dapp

# Verify the project structure
ls -la
```

You should see the following structure:
```
solvent-dapp/
├── src/                    # Main application code
├── pages/                  # Next.js pages and API routes
├── scripts/                # Utility scripts
├── burrowborn_candy/       # Candy Machine assets
├── public/                 # Static assets
├── styles/                 # Global styles
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

## Step 3: Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify TypeScript is available
npx tsc --version
```

## Step 4: Environment Setup

Create your environment file:

```bash
# Copy the example environment file
cp .env.example .env.local

# Or create it manually
touch .env.local
```

## Step 5: Verify Project Structure

The project should have the following key directories:

### `/src` - Main Application Code
- `components/` - React components
- `hooks/` - Custom React hooks
- `config.ts` - Configuration file
- `Home.tsx` - Main application component
- `main.tsx` - Application entry point

### `/pages` - Next.js Pages
- `api/` - API endpoints
- `_app.tsx` - App wrapper
- `index.tsx` - Entry page

### `/scripts` - Utility Scripts
- `checks/` - Verification scripts
- `delegation/` - NFT delegation scripts
- `escrow/` - Escrow PDA scripts
- `setup/` - Environment setup
- `utilities/` - Utility scripts
- `testing/` - Testing scripts

## Step 6: Initial Configuration

Before proceeding, you'll need to configure the following:

1. **Solana Network** - Choose between devnet/mainnet
2. **Candy Machine ID** - Your deployed Candy Machine address
3. **Collection Details** - NFT collection information
4. **External Services** - Pinata, Helius API keys

## Troubleshooting

### Common Issues

**"Command not found: npm"**
```bash
# Install Node.js from https://nodejs.org/
# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**"Permission denied"**
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

**"Dependencies failed to install"**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Verification Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Node.js version 18+ installed
- [ ] Environment file created
- [ ] Project structure verified
- [ ] No TypeScript compilation errors

## Next Steps

Once you've completed this setup, proceed to:
- [Setting up Candy Machine](./02-candy-machine-setup.md)
- [Configuring Next.js](./03-nextjs-setup.md)

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the main [README.md](../README.md)
3. Open an issue on GitHub
4. Check the console for error messages 