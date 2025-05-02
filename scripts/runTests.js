const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s };

console.log(chalk.yellow('🧪 Running Smart Contract Tests...'));

// Create and execute the hardhat test command
const hardhatProcess = spawn('npx', ['hardhat', 'test'], { 
  stdio: 'inherit',
  shell: true
});

// Handle process completion
hardhatProcess.on('close', (code) => {
  if (code === 0) {
    console.log(chalk.green('✅ All tests passed successfully!'));
  } else {
    console.log(chalk.red(`❌ Tests failed with code ${code}`));
    process.exit(code);
  }
}); 