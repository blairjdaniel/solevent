# 8. Deploy to Vercel and Production Testing

This guide covers deploying the SolEvent DApp to Vercel and conducting production testing.

## Prerequisites

- Application tested locally
- GitHub repository set up
- Vercel account created
- All environment variables ready

## Step 1: Prepare for Deployment

### Final Code Review
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

### Verify Production Build
```bash
# Test production build locally
npm run build

# Check for build errors
# Should complete without errors
```

### Update Environment Variables for Production
Create production environment variables:

```env
# Production Environment Variables
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com

# Update with production addresses
NEXT_PUBLIC_CANDY_MACHINE_ID=YOUR_MAINNET_CANDY_MACHINE_ID
NEXT_PUBLIC_COLLECTION_MINT_ADDRESS=YOUR_MAINNET_COLLECTION_MINT_ADDRESS
NEXT_PUBLIC_TREASURY=YOUR_MAINNET_TREASURY_ADDRESS
NEXT_PUBLIC_CANDY_GUARD_ADDRESS=YOUR_MAINNET_GUARD_ADDRESS
NEXT_PUBLIC_ESCROW_PDA=YOUR_MAINNET_ESCROW_PDA

# Production API keys
NEXT_PUBLIC_PINATA_API_KEY=YOUR_PRODUCTION_PINATA_API_KEY
NEXT_PUBLIC_PINATA_SECRET_API_KEY=YOUR_PRODUCTION_PINATA_SECRET_KEY
NEXT_PUBLIC_HELIUS_API_KEY=YOUR_PRODUCTION_HELIUS_API_KEY
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_PRODUCTION_HELIUS_API_KEY
```

## Step 2: Deploy to Vercel

### Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### Configure Build Settings
```json
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Set Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add all production environment variables
3. Set environment to "Production"

### Deploy
```bash
# Deploy using Vercel CLI
vercel --prod

# Or deploy through Vercel dashboard
# Click "Deploy" button
```

## Step 3: Configure Custom Domain (Optional)

### Add Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### SSL Certificate
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working correctly

## Step 4: Production Testing

### Test Production Build
```bash
# Test the deployed application
# Navigate to your Vercel URL
# Example: https://your-app.vercel.app
```

### Verify Environment Variables
```javascript
// Check in browser console
console.log('Production environment check:', {
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  candyMachine: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID,
  collection: process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS
});
```

### Test Core Functionality
1. **Wallet Connection**: Connect wallet on production
2. **Candy Machine Loading**: Verify data loads correctly
3. **Minting**: Test minting with real SOL
4. **NFT Display**: Check NFT gallery functionality

## Step 5: Performance Monitoring

### Set Up Vercel Analytics
1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. Monitor performance metrics

### Monitor Core Web Vitals
```javascript
// Add performance monitoring
export function reportWebVitals(metric) {
  console.log('Web Vital:', metric);
  
  // Send to analytics service
  if (metric.label === 'web-vital') {
    // Send to your analytics
  }
}
```

### Set Up Error Tracking
```javascript
// Add error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Send error to monitoring service
    console.error('Production error:', error, errorInfo);
    
    // Example: Send to Sentry or similar
    // Sentry.captureException(error, { extra: errorInfo });
  }
}
```

## Step 6: Security Testing

### Test HTTPS
```bash
# Verify HTTPS is working
curl -I https://your-app.vercel.app

# Should return 200 OK with HTTPS headers
```

### Test Environment Security
```javascript
// Verify sensitive data is not exposed
const checkSecurity = () => {
  const sensitiveKeys = [
    'NEXT_PUBLIC_PINATA_SECRET_API_KEY',
    'WALLET_SECRET_KEY'
  ];
  
  sensitiveKeys.forEach(key => {
    if (process.env[key]) {
      console.warn(`⚠️ Sensitive key ${key} is exposed in production`);
    }
  });
};

checkSecurity();
```

### Test API Security
```bash
# Test API endpoints
curl -X POST https://your-app.vercel.app/api/mint-hook \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "test"}'

# Should return appropriate response
```

## Step 7: Load Testing

### Test Concurrent Users
```bash
# Install load testing tool
npm install -g artillery

# Create load test configuration
# artillery-config.yml
```

```yaml
# artillery-config.yml
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Load test"
    requests:
      - get:
          url: "/"
```

```bash
# Run load test
artillery run artillery-config.yml
```

### Monitor Performance Under Load
- Check response times
- Monitor error rates
- Verify functionality under load

## Step 8: Monitoring and Alerts

### Set Up Vercel Monitoring
1. Go to Project Settings → Monitoring
2. Configure alerts for:
   - Build failures
   - Function timeouts
   - Error rates

### Set Up External Monitoring
```javascript
// Add health check endpoint
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
```

### Monitor External Services
```javascript
// Add service health checks
const checkServices = async () => {
  const services = [
    { name: 'Helius', url: 'https://mainnet.helius-rpc.com' },
    { name: 'Pinata', url: 'https://api.pinata.cloud' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      console.log(`${service.name}: ${response.ok ? 'OK' : 'ERROR'}`);
    } catch (error) {
      console.error(`${service.name}: ERROR`, error);
    }
  }
};

// Run health checks periodically
setInterval(checkServices, 300000); // Every 5 minutes
```

## Step 9: Post-Deployment Verification

### Test Complete User Journey
1. **Landing Page**: Verify page loads correctly
2. **Wallet Connection**: Test with multiple wallets
3. **Minting Flow**: Complete end-to-end minting
4. **NFT Management**: Test redemption and display
5. **Mobile Experience**: Test on mobile devices

### Cross-Browser Testing
```bash
# Test in multiple browsers
# - Chrome
# - Firefox
# - Safari
# - Edge
# - Mobile browsers
```

### Performance Verification
```javascript
// Test production performance
const testProductionPerformance = () => {
  const startTime = performance.now();
  
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`Production load time: ${loadTime.toFixed(2)}ms`);
    
    // Should be under 3 seconds
    if (loadTime < 3000) {
      console.log('✅ Production performance: PASS');
    } else {
      console.log('❌ Production performance: FAIL');
    }
  });
};

testProductionPerformance();
```

## Step 10: Maintenance and Updates

### Set Up Automated Deployments
```bash
# Configure GitHub Actions for auto-deployment
# .github/workflows/deploy.yml
```

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Monitor and Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Test after updates
npm run build
npm run test
```

### Backup and Recovery
```bash
# Backup environment variables
# Export from Vercel dashboard

# Backup database (if applicable)
# Set up automated backups
```

## Troubleshooting

### Common Deployment Issues

**"Build failed"**
```bash
# Check build logs in Vercel
# Verify all dependencies are installed
# Check for TypeScript errors
npm run build
```

**"Environment variables not loading"**
```bash
# Verify variables are set in Vercel
# Check variable names start with NEXT_PUBLIC_
# Restart deployment
```

**"API endpoints not working"**
```bash
# Check API routes are in pages/api/
# Verify CORS configuration
# Test endpoints locally first
```

**"Performance issues"**
```bash
# Check bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images and assets
# Enable compression
```

### Verification Checklist

- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Custom domain working (if applicable)
- [ ] HTTPS enabled
- [ ] Core functionality working
- [ ] Performance acceptable
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Load testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] Security measures verified
- [ ] Backup procedures in place

## Next Steps

After successful deployment:
- Monitor application performance
- Set up user analytics
- Plan feature updates
- Maintain security updates

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Production](https://nextjs.org/docs/deployment)
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Artillery Load Testing](https://www.artillery.io/) 