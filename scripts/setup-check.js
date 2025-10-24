#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required environment variables and dependencies are configured
 */

const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

console.log('🔍 Checking AutoContent.AI setup...\n');

let hasErrors = false;

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('   Create one by copying .env.example:');
  console.log('   cp .env.example .env\n');
  hasErrors = true;
} else {
  console.log('✅ .env file exists\n');

  // Load environment variables
  require('dotenv').config();

  // Check each required variable
  console.log('Checking environment variables:\n');
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.includes('your-') || value.includes('YOUR-')) {
      console.error(`❌ ${varName} - Not configured`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName} - Configured`);
    }
  });
}

// Check if node_modules exists
console.log('\nChecking dependencies:\n');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ Dependencies not installed');
  console.log('   Run: npm install\n');
  hasErrors = true;
} else {
  console.log('✅ Dependencies installed\n');
}

// Check if Prisma client is generated
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.error('❌ Prisma client not generated');
  console.log('   Run: npm run db:generate\n');
  hasErrors = true;
} else {
  console.log('✅ Prisma client generated\n');
}

// Final message
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ Setup incomplete! Please fix the errors above.\n');
  console.log('📖 See SETUP_GUIDE.md for detailed instructions.\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! You\'re ready to go!\n');
  console.log('🚀 Start the development server with: npm run dev\n');
  process.exit(0);
}


