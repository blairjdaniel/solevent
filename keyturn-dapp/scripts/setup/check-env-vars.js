#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('🔍 Checking environment variables from .env.local:');
console.log('');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  console.log('📁 Path:', envPath);
  console.log('');
  
  // Read and display the file content
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env.local content:');
  console.log('---');
  console.log(envContent);
  console.log('---');
  console.log('');
} else {
  console.log('❌ .env.local file does not exist');
}

console.log('🔧 Environment variables loaded:');
console.log('  NEXT_PUBLIC_CANDY_MACHINE_ID:', process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
console.log('  NEXT_PUBLIC_COLLECTION_MINT_ADDRESS:', process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);
console.log('  NEXT_PUBLIC_ESCROW_PDA:', process.env.NEXT_PUBLIC_ESCROW_PDA);
console.log('  NEXT_PUBLIC_SOLANA_NETWORK:', process.env.NEXT_PUBLIC_SOLANA_NETWORK);
console.log('  NEXT_PUBLIC_SOLANA_RPC_HOST:', process.env.NEXT_PUBLIC_SOLANA_RPC_HOST);
console.log('  NEXT_PUBLIC_TREASURY:', process.env.NEXT_PUBLIC_TREASURY);
console.log('  NEXT_PUBLIC_CANDY_GUARD_ADDRESS:', process.env.NEXT_PUBLIC_CANDY_GUARD_ADDRESS);
console.log('');

// Check for any issues
if (!process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS) {
  console.log('❌ NEXT_PUBLIC_COLLECTION_MINT_ADDRESS is not set');
} else if (process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS === '8VKr8UrydxpmiNH7NrzD5RKHveG3PY9MTLmnJpzJ2APW') {
  console.log('⚠️  NEXT_PUBLIC_COLLECTION_MINT_ADDRESS is still the old address');
} else {
  console.log('✅ NEXT_PUBLIC_COLLECTION_MINT_ADDRESS is set to:', process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS);
} 