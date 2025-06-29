# SolEvent DApp - Complete Setup Guide

Welcome to the comprehensive setup guide for the SolEvent DApp. This documentation will walk you through the entire process of setting up, configuring, testing, and deploying your Solana NFT minting application.

## 📚 Documentation Overview

This guide is organized into 8 main sections, each covering a specific aspect of the development and deployment process:

### 🚀 Getting Started
**[01-getting-started.md](./01-getting-started.md)**
- Git clone and initial setup
- Prerequisites and requirements
- Project structure overview
- Environment configuration basics
- Troubleshooting common setup issues

### 🍬 Candy Machine Setup
**[02-candy-machine-setup.md](./02-candy-machine-setup.md)**
- Installing Solana CLI and Sugar CLI
- Preparing NFT assets and metadata
- Deploying Candy Machine v3
- Configuring Candy Guards
- Testing minting functionality

### ⚛️ Next.js Configuration
**[03-nextjs-setup.md](./03-nextjs-setup.md)**
- Configuring Next.js and TypeScript
- Setting up environment variables
- Customizing Home.tsx component
- Configuring API routes
- Styling and UI customization

### 🔗 External Services
**[04-external-services.md](./04-external-services.md)**
- Setting up Vercel deployment
- Configuring Helius for NFT queries
- Setting up Pinata for IPFS storage
- Webhook configuration
- CORS and security setup

### 👛 Wallet Integration
**[05-wallet-connections.md](./05-wallet-connections.md)**
- Wallet adapter configuration
- Metaplex Umi integration
- Wallet connection components
- Balance display and monitoring
- Transaction signing and minting

### 🔧 Application Integration
**[06-connecting-everything.md](./06-connecting-everything.md)**
- Final environment configuration
- Dependency verification
- Application startup and testing
- Performance optimization
- Error handling and debugging

### 🧪 Testing
**[07-testing.md](./07-testing.md)**
- Functional testing procedures
- Component and API testing
- External service integration testing
- Performance and security testing
- Cross-browser and mobile testing

### 🚀 Deployment
**[08-deployment.md](./08-deployment.md)**
- Production deployment to Vercel
- Custom domain configuration
- Performance monitoring setup
- Security testing and verification
- Maintenance and updates

## 🎯 Quick Start Path

For experienced developers who want to get up and running quickly:

1. **[01-getting-started.md](./01-getting-started.md)** - Clone and basic setup
2. **[02-candy-machine-setup.md](./02-candy-machine-setup.md)** - Deploy Candy Machine
3. **[03-nextjs-setup.md](./03-nextjs-setup.md)** - Configure application
4. **[06-connecting-everything.md](./06-connecting-everything.md)** - Run the application
5. **[08-deployment.md](./08-deployment.md)** - Deploy to production

## 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Solana CLI** (for Candy Machine deployment)
- **A Solana wallet** (Phantom recommended)
- **GitHub account** (for repository management)
- **Vercel account** (for deployment)

## 📋 Environment Variables Checklist

You'll need to configure these environment variables throughout the process:

### Required Variables
```env
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# Candy Machine
NEXT_PUBLIC_CANDY_MACHINE_ID=your_candy_machine_id
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=your_collection_mint_address
NEXT_PUBLIC_TREASURY=your_treasury_address
NEXT_PUBLIC_CANDY_GUARD_ADDRESS=your_guard_address

# Collection
NEXT_PUBLIC_COLLECTION_NAME=SolEvent
NEXT_PUBLIC_COLLECTION_DESCRIPTION=Your collection description

# External Services
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
```

## 🛠️ Project Structure

```
solvent-dapp/
├── src/                    # Main application code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── config.ts          # Configuration file
│   ├── Home.tsx           # Main application component
│   └── main.tsx           # Application entry point
├── pages/                 # Next.js pages and API routes
│   ├── api/               # API endpoints
│   ├── _app.tsx           # App wrapper
│   └── index.tsx          # Entry page
├── scripts/               # Utility scripts
│   ├── checks/            # Verification scripts
│   ├── delegation/        # NFT delegation scripts
│   ├── escrow/            # Escrow PDA scripts
│   ├── setup/             # Environment setup
│   ├── utilities/         # Utility scripts
│   └── testing/           # Testing scripts
├── burrowborn_candy/      # Candy Machine assets
├── docs/                  # This documentation
├── public/                # Static assets
├── styles/                # Global styles
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🎨 Features

The SolEvent DApp includes the following features:

- **🎨 Modern UI**: Responsive design with gradient backgrounds
- **🔗 Wallet Integration**: Support for Phantom and other Solana wallets
- **🍬 Candy Machine v3**: Full support for Metaplex Candy Machine v3
- **🎯 Real-time Minting**: Live minting status and NFT display
- **🎉 Success Animations**: Mint success popups and celebrations
- **📱 Mobile Friendly**: Optimized for mobile devices
- **🔄 NFT Redemption**: Escrow and redemption functionality
- **📊 Balance Display**: Real-time wallet balance monitoring
- **🔒 Security**: Comprehensive error handling and validation

## 🚀 Deployment Options

The application can be deployed to:

- **Vercel** (Recommended) - Automatic deployments, SSL, CDN
- **Netlify** - Alternative hosting platform
- **Self-hosted** - Docker or traditional hosting

## 📞 Support

If you encounter issues during setup:

1. **Check the troubleshooting sections** in each guide
2. **Review the verification checklists** at the end of each guide
3. **Check the browser console** for error messages
4. **Verify environment variables** are set correctly
5. **Ensure all prerequisites** are installed

## 🔄 Updates and Maintenance

To keep your application up to date:

1. **Monitor dependencies** for security updates
2. **Test thoroughly** before deploying updates
3. **Backup environment variables** and configuration
4. **Monitor performance** and error rates
5. **Keep documentation** updated with changes

## 📖 Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Phantom Wallet](https://phantom.app/)

## 🎯 Next Steps

Ready to get started? Begin with **[01-getting-started.md](./01-getting-started.md)** to set up your development environment and clone the repository.

---

**Happy building! 🚀**

*This documentation is designed to be comprehensive yet easy to follow. Each section builds upon the previous one, ensuring a smooth development experience.* 