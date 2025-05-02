const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

function clearBrowserCache() {
  console.log('\n⚠️ Important: You need to clear your browser cache and local storage!');
  console.log('   1. Open browser developer tools (F12 or Ctrl+Shift+I / Cmd+Option+I)');
  console.log('   2. Go to Application tab > Storage > Clear Site Data');
  console.log('   3. Reload the page');
}

function checkForPermissionFix() {
  const authContextPath = path.join(__dirname, '..', 'frontend', 'src', 'context', 'AuthContext.js');
  
  if (fs.existsSync(authContextPath)) {
    const content = fs.readFileSync(authContextPath, 'utf8');
    
    if (!content.includes('const ownerAddress = await contract.owner()')) {
      console.log('\n⚠️ Warning: AdminPanel permission fix not found in AuthContext.js');
      console.log('   The frontend may not recognize admin users correctly.');
      return false;
    }
    
    console.log('\n✅ Admin permission fix detected in AuthContext.js');
    return true;
  }
  
  return false;
}

async function main() {
  console.log('\n🚀 Starting complete reset and redeploy process...');
  
  // 1. Clean the project
  if (!executeCommand('npm run clean', 'Cleaning the project')) return;
  
  // 2. Compile contracts
  if (!executeCommand('npm run compile', 'Compiling contracts')) return;
  
  // 3. Deploy contracts
  if (!executeCommand('npm run deploy', 'Deploying contracts')) return;
  
  // 4. Apply frontend fixes
  if (!executeCommand('npm run reset-frontend', 'Resetting frontend')) return;
  
  // 5. Add test data
  if (!executeCommand('npm run add-test-data', 'Adding test data')) return;
  
  // 6. Test deployment
  if (!executeCommand('npm run test-deployment', 'Testing deployment')) return;
  
  // Check for permission fix
  checkForPermissionFix();
  
  console.log('\n✅ Reset and redeploy process completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart your frontend application:');
  console.log('      cd frontend');
  console.log('      npm run build');
  console.log('      npm run start');
  
  clearBrowserCache();
  
  console.log('\n🎉 You should now have a fully functional E-Waste Tracker application!');
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 