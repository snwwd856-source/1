// Script to generate bcrypt password hashes for SQL file
// Run: node generate_password_hashes.js

const bcrypt = require('bcrypt');

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const demoHash = await bcrypt.hash('demo123', 10);
  
  console.log('Admin password (admin123):');
  console.log(adminHash);
  console.log('\nDemo password (demo123):');
  console.log(demoHash);
  console.log('\nCopy these hashes to database_setup.sql file');
}

generateHashes().catch(console.error);

