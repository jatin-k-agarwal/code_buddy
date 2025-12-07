import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { basename } from 'path';
import { startWatcher } from './watcher.js';
import { printHeader } from './ui.js';
import { SSHHandler } from './ssh-handler.js';
import { isGitRepository, getCurrentBranch } from './git-operations.js';

/**
 * Create the main CLI command
 * @returns {Command} The configured commander program
 */
export function createCommand() {
  const program = new Command();

  program
    .name('code_buddy')
    .description('A Sophisticated CLI tool for git assistance')
    .version('1.0.0');

  // Status command
  program
    .command('status')
    .alias('s')
    .description('Show enhanced git status with helpful information')
    .action(handleStatus);

  // Info command
  program
    .command('info')
    .alias('i')
    .description('Show repository information and current branch details')
    .action(handleInfo);

  // Branch command
  program
    .command('branch')
    .alias('b')
    .description('List all branches with additional information')
    .option('-r, --remote', 'Show remote branches')
    .option('-a, --all', 'Show all branches (local and remote)')
    .action(handleBranch);

  // Watch command
  program
    .command('watch')
    .alias('w')
    .description('Watch files for changes and log modifications')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--use-ai', 'Use AI for commit message generation')
    .option('--no-tests', 'Skip running tests on file change', false)
    .option('--no-lint', 'Skip linting on file change', false)
    .option('--yes', 'Automatically confirm all prompts', false)
    .option('--ignore <patterns...>', 'Additional patterns to ignore')
    .action(handleWatch);

  // SSH setup command
  program
    .command('ssh-setup')
    .alias('ssh')
    .description('Generate and setup SSH key for GitHub')
    .argument('[email]', 'Email address for the SSH key')
    .action(handleSSHSetup);

  return program;
}

/**
 * Handle the status command
 */
async function handleStatus() {
  try {
    printHeader('🔍 code_buddy - Enhanced Status');

    if (!isGitRepository()) {
      console.log(chalk.red('❌ This is not a git repository'));
      process.exit(1);
    }

    // Get current branch
    const currentBranch = getCurrentBranch();
    console.log(chalk.green(`📍 Current branch: ${chalk.bold(currentBranch)}`));

    // Get git status
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });

    if (status.trim() === '') {
      console.log(chalk.green('✅ Working directory clean'));
    } else {
      console.log(chalk.yellow('📝 Changes detected:'));
      const lines = status.trim().split('\n');
      lines.forEach(line => {
        const statusCode = line.substring(0, 2);
        const fileName = line.substring(3);
        console.log(`   ${getStatusIcon(statusCode)} ${fileName}`);
      });
    }

    // Check for unpushed commits
    try {
      const unpushed = execSync(`git log origin/${currentBranch}..HEAD --oneline`, { encoding: 'utf-8' });
      if (unpushed.trim()) {
        console.log(chalk.cyan(`\n📤 Unpushed commits: ${unpushed.trim().split('\n').length}`));
      }
    } catch (error) {
      // Ignore if remote branch doesn't exist
    }

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Handle the info command
 */
async function handleInfo() {
  try {
    printHeader('📊 code_buddy - Repository Information');

    if (!isGitRepository()) {
      console.log(chalk.red('❌ This is not a git repository'));
      process.exit(1);
    }

    // Repository name
    const repoPath = process.cwd();
    const repoName = basename(repoPath);
    console.log(chalk.green(`📁 Repository: ${chalk.bold(repoName)}`));

    // Remote origin
    try {
      const origin = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      console.log(chalk.green(`🌐 Origin: ${origin}`));
    } catch (error) {
      console.log(chalk.yellow('🌐 Origin: Not configured'));
    }

    // Current branch
    const currentBranch = getCurrentBranch();
    console.log(chalk.green(`📍 Current branch: ${chalk.bold(currentBranch)}`));

    // Last commit
    try {
      const lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%an, %ar)"', { encoding: 'utf-8' });
      console.log(chalk.green(`📝 Last commit: ${lastCommit}`));
    } catch (error) {
      console.log(chalk.yellow('📝 Last commit: No commits yet'));
    }

    // Total commits
    try {
      const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
      console.log(chalk.green(`📈 Total commits: ${commitCount}`));
    } catch (error) {
      console.log(chalk.yellow('📈 Total commits: 0'));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Handle the branch command
 */
async function handleBranch(options) {
  try {
    printHeader('🌿 code_buddy - Branch Information');

    if (!isGitRepository()) {
      console.log(chalk.red('❌ This is not a git repository'));
      process.exit(1);
    }

    let command = 'git branch';
    if (options.all) {
      command += ' -a';
    } else if (options.remote) {
      command += ' -r';
    }

    const branches = execSync(command, { encoding: 'utf-8' });
    const branchLines = branches.trim().split('\n');

    branchLines.forEach(line => {
      const isCurrentBranch = line.startsWith('*');
      const branchName = line.replace(/^\*?\s+/, '').replace(/^remotes\//, '');

      if (isCurrentBranch) {
        console.log(chalk.green(`👉 ${chalk.bold(branchName)} (current)`));
      } else if (line.includes('remotes/')) {
        console.log(chalk.cyan(`🌐 ${branchName}`));
      } else {
        console.log(chalk.white(`📍 ${branchName}`));
      }
    });

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Handle the watch command
 */
async function handleWatch(options) {
  try {
    // Options from commander are passed directly to the watcher
    startWatcher(options);

    // Keep the process alive
    console.log(chalk.yellow('Press Ctrl+C to stop watching...\n'));
  } catch (error) {
    console.error(chalk.red(`❌ Error starting watcher: ${error.message}`));
    process.exit(1);
  }
}

// Functions are now imported from git-operations.js

/**
 * Get status icon for git status code
 * @param {string} statusCode
 * @returns {string}
 */
function getStatusIcon(statusCode) {
  const statusMap = {
    'M ': chalk.yellow('📝'), // Modified
    'A ': chalk.green('➕'),  // Added
    'D ': chalk.red('➖'),    // Deleted
    'R ': chalk.blue('🔄'),   // Renamed
    'C ': chalk.blue('📋'),   // Copied
    'U ': chalk.red('⚠️ '),   // Unmerged
    '??': chalk.gray('❓'),   // Untracked
    'AM': chalk.yellow('📝'), // Added then modified
    'MM': chalk.yellow('📝'), // Modified then modified
  };

  return statusMap[statusCode] || chalk.gray('❓');
}

/**
 * Handle the SSH setup command
 */
async function handleSSHSetup(email) {
  try {
    printHeader('🔐 code_buddy - SSH Key Setup');

    const sshHandler = new SSHHandler();

    // Check for existing keys
    const existingKeys = sshHandler.getExistingKeys();
    if (existingKeys.length > 0) {
      console.log(chalk.blue('📋 Existing SSH keys found:'));
      existingKeys.forEach(key => {
        console.log(chalk.gray(`  - ${key}`));
      });
    }

    // Generate the SSH key
    const result = await sshHandler.generateSSHKey(email);
    if (result.success) {
      sshHandler.displaySetupInstructions(result.publicKey);
    } else {
      console.log(chalk.red(`❌ ${result.message}`));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
  }
}

// Export for testing
export { handleStatus, handleInfo, handleBranch, handleWatch, isGitRepository, getCurrentBranch, handleSSHSetup };