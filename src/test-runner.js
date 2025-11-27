import { spawn } from 'child_process';
import chalk from 'chalk';

/**
 * Run a command and return the result
 * @param {string} command - Command to run
 * @param {Array<string>} args - Command arguments
 * @param {Object} options - Spawn options
 * @returns {Promise<{success: boolean, output: string, error: string}>}
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let output = '';
    let error = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        error: error.trim()
      });
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: err.message
      });
    });
  });
}

/**
 * Run tests using the configured test command
 * @param {string} testCommand - Test command to run
 * @returns {Promise<boolean>} True if tests pass
 */
export async function runTests(testCommand = 'npm run test') {
  // Skip console output during tests
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.blue('🧪 Running tests...'));
  }
  
  const [command, ...args] = testCommand.split(' ');
  const result = await runCommand(command, args);
  
  if (result.success) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.green('✅ Tests passed'));
      if (result.output) {
        console.log(chalk.gray(result.output));
      }
    }
    return true;
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.red('❌ Tests failed'));
      if (result.error) {
        console.log(chalk.red(result.error));
      }
      if (result.output) {
        console.log(chalk.gray(result.output));
      }
    }
    return false;
  }
}

/**
 * Run linting using the configured lint command
 * @param {string} lintCommand - Lint command to run
 * @returns {Promise<boolean>} True if linting passes
 */
export async function runLint(lintCommand = 'npm run lint') {
  // Skip console output during tests
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.blue('🔍 Running linter...'));
  }
  
  const [command, ...args] = lintCommand.split(' ');
  const result = await runCommand(command, args);
  
  if (result.success) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.green('✅ Linting passed'));
      if (result.output) {
        console.log(chalk.gray(result.output));
      }
    }
    return true;
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.red('❌ Linting failed'));
      if (result.error) {
        console.log(chalk.red(result.error));
      }
      if (result.output) {
        console.log(chalk.gray(result.output));
      }
    }
    return false;
  }
}

/**
 * Run both tests and linting
 * @param {Object} config - Configuration object
 * @returns {Promise<{testsPass: boolean, lintPass: boolean}>}
 */
export async function runChecks(config) {
  const results = {
    testsPass: true,
    lintPass: true
  };

  if (config.runTests) {
    results.testsPass = await runTests(config.testCommand);
  } else {
    console.log(chalk.yellow('⏭️  Skipping tests (disabled in config)'));
  }

  if (config.runLint) {
    results.lintPass = await runLint(config.lintCommand);
  } else {
    console.log(chalk.yellow('⏭️  Skipping linting (disabled in config)'));
  }

  return results;
}

/**
 * Check if both tests and linting passed
 * @param {Object} results - Results from runChecks
 * @returns {boolean} True if all checks passed
 */
export function allChecksPassed(results) {
  return results.testsPass && results.lintPass;
}