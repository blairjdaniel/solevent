# 7. Testing the SolEvent DApp

This guide covers comprehensive testing of the SolEvent DApp to ensure all functionality works correctly.

## Prerequisites

- Application running successfully
- Wallet connected
- Candy Machine deployed and configured
- Test SOL available in wallet

## Step 1: Functional Testing

### Test Wallet Connection
```bash
# 1. Open browser developer tools
# 2. Navigate to Console tab
# 3. Connect wallet and verify logs
```

**Expected Results:**
- Wallet connects without errors
- Public key displays correctly
- Balance shows accurate SOL amount
- No connection errors in console

### Test Candy Machine Loading
```bash
# 1. Wait for page to load completely
# 2. Check console for Candy Machine data
# 3. Verify mint button appears
```

**Expected Results:**
```
🔧 SolEvent DApp Config loaded:
  NETWORK: devnet
  candyMachineId: YOUR_CANDY_MACHINE_ID
  collectionMintAddress: YOUR_COLLECTION_MINT_ADDRESS
```

### Test Minting Functionality
```bash
# 1. Ensure wallet has sufficient SOL (at least 0.1 SOL)
# 2. Click "Mint" button
# 3. Approve transaction in wallet
# 4. Wait for confirmation
```

**Expected Results:**
- Mint button is clickable
- Transaction approval dialog appears
- Transaction completes successfully
- NFT appears in wallet
- Success popup displays

## Step 2: Component Testing

### Test Mint Button Component
```typescript
// Test in browser console
const mintButton = document.querySelector('[data-testid="mint-button"]');
console.log('Mint button found:', !!mintButton);
console.log('Mint button disabled:', mintButton?.disabled);
```

### Test Wallet Display Component
```typescript
// Test wallet connection display
const walletDisplay = document.querySelector('[data-testid="wallet-display"]');
console.log('Wallet display found:', !!walletDisplay);
console.log('Wallet connected:', walletDisplay?.textContent?.includes('SOL'));
```

### Test NFT Gallery Component
```typescript
// Test NFT display after minting
const nftGallery = document.querySelector('[data-testid="nft-gallery"]');
console.log('NFT gallery found:', !!nftGallery);
console.log('NFTs displayed:', nftGallery?.children?.length || 0);
```

## Step 3: API Testing

### Test Mint Hook API
```bash
# Test mint hook endpoint
curl -X POST http://localhost:3000/api/mint-hook \
  -H "Content-Type: application/json" \
  -d '{
    "mintAddress": "test-mint-address"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "mintAddress": "test-mint-address"
}
```

### Test Deposit Hook API
```bash
# Test deposit hook endpoint
curl -X POST http://localhost:3000/api/deposit-hook \
  -H "Content-Type: application/json" \
  -d '{
    "mintAddress": "test-mint-address"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "mintAddress": "test-mint-address"
}
```

### Test Update Metadata API
```bash
# Test metadata update endpoint
curl -X POST http://localhost:3000/api/update-metadata \
  -H "Content-Type: application/json" \
  -d '{
    "mintAddress": "test-mint-address"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "transaction-signature"
}
```

## Step 4: External Service Testing

### Test Helius Integration
```javascript
// Test in browser console
const testHeliusQuery = async () => {
  try {
    const response = await fetch('https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: 'YOUR_WALLET_ADDRESS',
          page: 1,
          limit: 5,
        },
      }),
    });
    
    const data = await response.json();
    console.log('Helius test result:', data);
    return data.result?.items?.length > 0;
  } catch (error) {
    console.error('Helius test failed:', error);
    return false;
  }
};

testHeliusQuery();
```

### Test Pinata Integration
```javascript
// Test metadata upload
const testPinataUpload = async () => {
  try {
    const metadata = {
      name: 'Test NFT',
      symbol: 'TEST',
      description: 'Test NFT for verification',
      image: 'ipfs://QmTestHash',
      attributes: []
    };

    const formData = new FormData();
    formData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Pinata test result:', result);
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata test failed:', error);
    return null;
  }
};

testPinataUpload();
```

## Step 5: Error Handling Testing

### Test Network Errors
```javascript
// Simulate network error
const testNetworkError = () => {
  // Temporarily change RPC endpoint to invalid URL
  const originalRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
  process.env.NEXT_PUBLIC_SOLANA_RPC_HOST = 'https://invalid-rpc.com';
  
  // Refresh page and check error handling
  window.location.reload();
  
  // Restore original RPC
  process.env.NEXT_PUBLIC_SOLANA_RPC_HOST = originalRpc;
};
```

### Test Wallet Disconnection
```javascript
// Test wallet disconnection handling
const testWalletDisconnect = () => {
  // Disconnect wallet
  if (window.solana) {
    window.solana.disconnect();
  }
  
  // Check if app handles disconnection gracefully
  console.log('Wallet disconnected, checking app state...');
};
```

### Test Invalid Candy Machine
```javascript
// Test with invalid Candy Machine ID
const testInvalidCandyMachine = () => {
  // Temporarily change Candy Machine ID
  const originalId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID = 'invalid-id';
  
  // Refresh page and check error handling
  window.location.reload();
  
  // Restore original ID
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID = originalId;
};
```

## Step 6: Performance Testing

### Test Page Load Performance
```javascript
// Test page load time
const testPageLoadPerformance = () => {
  const startTime = performance.now();
  
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
    
    // Check if load time is acceptable (< 3 seconds)
    if (loadTime < 3000) {
      console.log('✅ Page load performance: PASS');
    } else {
      console.log('❌ Page load performance: FAIL');
    }
  });
};

testPageLoadPerformance();
```

### Test Bundle Size
```bash
# Check bundle size
npm run build

# Analyze bundle
npx @next/bundle-analyzer
```

### Test Memory Usage
```javascript
// Monitor memory usage
const testMemoryUsage = () => {
  if (performance.memory) {
    console.log('Memory usage:', {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    });
  }
};

// Test every 10 seconds
setInterval(testMemoryUsage, 10000);
```

## Step 7: Cross-Browser Testing

### Test in Different Browsers
```bash
# Test in Chrome
# Test in Firefox
# Test in Safari
# Test in Edge
```

**Test Cases:**
- Wallet connection
- Minting functionality
- NFT display
- Responsive design
- Console errors

### Test Mobile Responsiveness
```bash
# Test on mobile devices or browser dev tools
# Check responsive breakpoints
# Test touch interactions
```

## Step 8: Security Testing

### Test Environment Variables
```javascript
// Check for exposed sensitive data
const testEnvironmentSecurity = () => {
  const sensitiveVars = [
    'NEXT_PUBLIC_PINATA_SECRET_API_KEY',
    'WALLET_SECRET_KEY'
  ];
  
  sensitiveVars.forEach(varName => {
    if (process.env[varName] && process.env[varName] !== 'undefined') {
      console.warn(`⚠️ Sensitive variable ${varName} is exposed`);
    }
  });
};

testEnvironmentSecurity();
```

### Test Input Validation
```javascript
// Test API input validation
const testInputValidation = async () => {
  const testCases = [
    { mintAddress: '' },
    { mintAddress: 'invalid-address' },
    { mintAddress: null },
    { mintAddress: undefined }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await fetch('/api/mint-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      });
      
      console.log(`Input validation test for ${JSON.stringify(testCase)}:`, response.status);
    } catch (error) {
      console.error('Input validation test failed:', error);
    }
  }
};

testInputValidation();
```

## Step 9: Integration Testing

### Test Complete User Flow
```javascript
// Test complete minting flow
const testCompleteFlow = async () => {
  console.log('🧪 Starting complete flow test...');
  
  // 1. Connect wallet
  console.log('1. Testing wallet connection...');
  // (Manual step - user connects wallet)
  
  // 2. Load Candy Machine
  console.log('2. Testing Candy Machine loading...');
  // (Automatic - check if data loads)
  
  // 3. Mint NFT
  console.log('3. Testing NFT minting...');
  // (Manual step - user clicks mint)
  
  // 4. Verify NFT in wallet
  console.log('4. Testing NFT verification...');
  // (Check if NFT appears in wallet)
  
  console.log('✅ Complete flow test finished');
};

testCompleteFlow();
```

## Step 10: Automated Testing Setup

### Install Testing Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Create Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Create Test Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### Write Basic Tests
```javascript
// __tests__/Home.test.tsx
import { render, screen } from '@testing-library/react';
import Home from '../src/Home';

describe('Home Component', () => {
  test('renders collection name', () => {
    render(<Home candyMachineId="test-id" />);
    expect(screen.getByText('SolEvent')).toBeInTheDocument();
  });
  
  test('renders connect wallet button', () => {
    render(<Home candyMachineId="test-id" />);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Testing Issues

**"Tests failing due to wallet connection"**
```javascript
// Mock wallet adapter for testing
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    publicKey: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
  useConnection: () => ({
    connection: {},
  }),
}));
```

**"API tests failing"**
```bash
# Ensure development server is running
npm run dev

# Check API endpoints are accessible
curl http://localhost:3000/api/health
```

**"Performance tests failing"**
```javascript
// Increase timeout for performance tests
jest.setTimeout(10000);
```

### Verification Checklist

- [ ] Wallet connection works in all browsers
- [ ] Minting functionality works correctly
- [ ] NFT display and gallery work
- [ ] API endpoints respond correctly
- [ ] External services integration works
- [ ] Error handling works properly
- [ ] Performance meets requirements
- [ ] Mobile responsiveness works
- [ ] Security measures are in place
- [ ] Automated tests pass

## Next Steps

Once testing is complete:
- [Deploy to Vercel](./08-deployment.md)
- Monitor production performance
- Set up error tracking

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Solana Test Validator](https://docs.solana.com/developing/test-validator)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) 