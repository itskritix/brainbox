#!/usr/bin/env node

/**
 * Deployment Configuration Script
 * This script helps configure BrainBox for deployment with custom domains
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🚀 BrainBox Deployment Configuration\n');

  // Ask for deployment strategy
  console.log('Choose your deployment strategy:');
  console.log('1. API Subdomain (app.yourdomain.com + api.yourdomain.com)');
  console.log('2. Same Domain + Reverse Proxy (yourdomain.com + yourdomain.com/api)');
  console.log('3. Different Ports (yourdomain.com:4000 + yourdomain.com:3000)');
  console.log('4. Custom configuration');

  const strategy = await ask('\nEnter your choice (1-4): ');
  
  let frontendUrl = '';
  let backendUrl = '';
  let serverDomain = '';

  switch (strategy) {
    case '1':
      const domain1 = await ask('Enter your base domain (e.g., yourdomain.com): ');
      frontendUrl = `https://app.${domain1}`;
      backendUrl = `https://api.${domain1}`;
      serverDomain = `api.${domain1}`;
      break;

    case '2':
      const domain2 = await ask('Enter your domain (e.g., yourdomain.com): ');
      frontendUrl = `https://${domain2}`;
      backendUrl = `https://${domain2}/api`;
      serverDomain = domain2;
      break;

    case '3':
      const domain3 = await ask('Enter your domain (e.g., yourdomain.com): ');
      const frontendPort = await ask('Enter frontend port (default: 4000): ') || '4000';
      const backendPort = await ask('Enter backend port (default: 3000): ') || '3000';
      frontendUrl = `https://${domain3}:${frontendPort}`;
      backendUrl = `https://${domain3}:${backendPort}`;
      serverDomain = `${domain3}:${backendPort}`;
      break;

    case '4':
      frontendUrl = await ask('Enter your frontend URL (e.g., https://app.yourdomain.com): ');
      backendUrl = await ask('Enter your backend URL (e.g., https://api.yourdomain.com): ');
      serverDomain = backendUrl.replace(/^https?:\/\//, '');
      break;

    default:
      console.log('Invalid choice. Exiting.');
      process.exit(1);
  }

  console.log('\n📋 Configuration Summary:');
  console.log(`Frontend URL: ${frontendUrl}`);
  console.log(`Backend URL:  ${backendUrl}`);
  console.log(`Server Domain: ${serverDomain}`);

  const confirm = await ask('\nIs this correct? (y/N): ');
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('Configuration cancelled.');
    process.exit(0);
  }

  // Create frontend .env.local
  const frontendEnv = `# BrainBox Frontend Configuration
# Generated on ${new Date().toISOString()}

VITE_SERVER_DOMAIN=${serverDomain}
`;

  const frontendEnvPath = path.join(__dirname, '..', 'apps', 'web', '.env.local');
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log(`✅ Created frontend config: ${frontendEnvPath}`);

  // Create backend .env example with CORS
  const backendEnv = `# BrainBox Backend Configuration  
# Generated on ${new Date().toISOString()}
# Copy this to .env and configure your specific values

SERVER_NAME="Your BrainBox Instance"
SERVER_CORS_ORIGIN=${frontendUrl}

# Database Configuration
POSTGRES_URL=postgresql://user:password@localhost:5432/brainbox_db

# Redis Configuration  
REDIS_URL=redis://localhost:6379/0

# Storage Configuration (adjust for your setup)
STORAGE_S3_ENDPOINT=http://localhost:9000
STORAGE_S3_ACCESS_KEY=minioadmin
STORAGE_S3_SECRET_KEY=minioadmin
STORAGE_S3_BUCKET=brainbox
STORAGE_S3_REGION=us-east-1
STORAGE_S3_FORCE_PATH_STYLE=true

# Email Configuration (optional)
SMTP_ENABLED=false
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=587
# SMTP_USER=noreply@yourdomain.com  
# SMTP_PASSWORD=your_password
# SMTP_EMAIL_FROM=noreply@yourdomain.com
`;

  const backendEnvPath = path.join(__dirname, '..', 'apps', 'server', '.env.deployment');
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log(`✅ Created backend config template: ${backendEnvPath}`);

  console.log('\n🎉 Configuration complete!');
  console.log('\nNext steps:');
  console.log('1. Configure your backend environment variables in apps/server/.env');
  console.log('2. Deploy your backend server');
  console.log('3. Deploy your frontend app');
  console.log('4. Test the connection');
  console.log('\nSee DEPLOYMENT.md for detailed instructions.');

  rl.close();
}

main().catch((error) => {
  console.error('Configuration failed:', error);
  process.exit(1);
});