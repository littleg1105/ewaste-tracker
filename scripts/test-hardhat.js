const { spawn, exec } = require('child_process');
const readline = require('readline');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s };

console.log(chalk.yellow('🧪 Testing Hardhat installation in Docker...'));

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Build the hardhat container if needed
console.log('Building the hardhat container...');
exec('docker-compose build hardhat', (error, stdout, stderr) => {
  if (error) {
    console.error(chalk.red(`Error building container: ${error.message}`));
    rl.close();
    process.exit(1);
  }
  
  // Run a simple command to test Hardhat installation
  console.log('Checking Hardhat version...');
  const dockerProcess = spawn('docker-compose', ['run', '--rm', 'hardhat', 'npx', 'hardhat', '--version'], {
    stdio: 'inherit',
    shell: true
  });

  dockerProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('✅ Hardhat is working correctly in Docker!'));
      
      // Ask if user wants to run tests
      rl.question('Do you want to run the full test suite? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log(chalk.yellow('🧪 Running smart contract tests...'));
          
          const testProcess = spawn('docker-compose', ['run', '--rm', 'hardhat', 'npx', 'hardhat', 'test'], {
            stdio: 'inherit',
            shell: true
          });
          
          testProcess.on('close', (testCode) => {
            if (testCode === 0) {
              console.log(chalk.green('✅ All tests passed!'));
            } else {
              console.log(chalk.red(`❌ Tests failed with code ${testCode}`));
            }
            rl.close();
          });
        } else {
          rl.close();
        }
      });
    } else {
      console.log(chalk.red(`❌ Hardhat check failed with code ${code}`));
      rl.close();
      process.exit(1);
    }
  });
}); 