#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 KeyTurn DApp Environment Setup');
console.log('================================\n');

const envPath = path.join(process.cwd(), '.env.local');
const examplePath = path.join(process.cwd(), '.env.example');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping setup.');
  console.log('   If you want to reconfigure, delete .env.local and run this script again.\n');
  process.exit(0);
}

// Read example file
if (!fs.existsSync(examplePath)) {
  console.log('❌ .env.example not found. Please create it first.');
  process.exit(1);
}

const exampleContent = fs.readFileSync(examplePath, 'utf8');

console.log('📝 Creating .env.local file...');
console.log('   Please update the values with your actual configuration.\n');

// Create .env.local with example content
fs.writeFileSync(envPath, exampleContent);

console.log('✅ .env.local created successfully!');
console.log('📋 Next steps:');
console.log('   1. Edit .env.local with your actual values');
console.log('   2. Run: npm install');
console.log('   3. Run: npm run dev');
console.log('\n🔗 For help, see README.md'); 