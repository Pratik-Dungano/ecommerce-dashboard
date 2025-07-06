const { execSync } = require('child_process');

console.log('Testing npm installation...');

try {
  // Test if npm is available
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
  
  // Test if node is available
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ node version: ${nodeVersion.trim()}`);
  
  console.log('✅ Environment looks good for npm install');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 