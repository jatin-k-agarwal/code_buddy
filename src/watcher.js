import chokidar from 'chokidar';
import chalk from 'chalk';
import { relative } from 'path';
import { getConfig } from './config.js';
import { runChecks, allChecksPassed } from './test-runner.js';
import { generateCommitMessage } from './commit-message.js';
import { stageAll, commit, push, getUnstagedDiff, hasChanges, getDiffStats } from './git-operations.js';
import { confirmWithDetails } from './user-interaction.js';
import { printHeader } from './ui.js';

/**
 * Start watching files in the current directory
 * @param {Object} options - Watcher configuration options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {Array<string>} options.ignore - Additional patterns to ignore
 * @returns {chokidar.FSWatcher} The watcher instance
 */
export function startWatcher(options = {}) {
  const { verbose = false, ignore = [] } = options;
  const config = getConfig();
  
  // Override config with CLI options
  // Commander converts --use-ai to options.useAi
  if (options.useAi || options.useAI) {
    config.useAI = true;
  }

  // Handle negation flags (Commander sets property to false if --no-X is passed)
  if (options.tests === false) {
    config.runTests = false;
  }
  if (options.lint === false) {
    config.runLint = false;
  }
  if (options.yes) {
    config.autoConfirm = true;
  }
  
  // Default ignore patterns
  const defaultIgnorePatterns = [
    '.git/**',
    'node_modules/**',
    'dist/**',
    '.DS_Store',
    '*.log',
    '.env*',
    'coverage/**',
    '.nyc_output/**',
    '**/*.tmp',
    '**/*.temp'
  ];

  // Combine default, config, and custom ignore patterns
  const ignorePatterns = [...defaultIgnorePatterns, ...config.watchIgnore, ...ignore];

  printHeader('👀 code_buddy - Enhanced File Watcher');

  if (verbose) {
    console.log(chalk.gray('Verbose mode enabled'));
  }

  console.log(chalk.green('📁 Watching current directory for changes...'));
  console.log(chalk.gray(`🚫 Ignoring: ${ignorePatterns.join(', ')}`));
  
  // Show current configuration
  console.log(chalk.blue('\n⚙️  Configuration:'));
  console.log(chalk.gray(`   Tests: ${config.runTests ? '✅' : '❌'}`));
  console.log(chalk.gray(`   Linting: ${config.runLint ? '✅' : '❌'}`));
  console.log(chalk.gray(`   AI Commits: ${config.useAI ? '✅' : '❌'}`));
  console.log(chalk.gray(`   Branch: ${config.branch}`));
  console.log('');

  // Track file changes to debounce processing
  let changeTimeout;
  const pendingChanges = new Set();

  // Initialize watcher
  const watcher = chokidar.watch('.', {
    ignored: ignorePatterns,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: false,
    usePolling: true, // Required for OneDrive/Network drives
    interval: 100,
    depth: undefined,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  /**
   * Process accumulated file changes
   */
  async function processChanges() {
    if (pendingChanges.size === 0) return;

    console.log(chalk.blue('\n🔄 Processing file changes...'));
    
    // Check if there are any git changes
    if (!hasChanges()) {
      console.log(chalk.yellow('⚠️  No git changes detected, skipping workflow'));
      pendingChanges.clear();
      return;
    }

    try {
      // Run tests and linting
      console.log(chalk.blue('\n📋 Running quality checks...'));
      const checkResults = await runChecks(config);

      if (!allChecksPassed(checkResults)) {
        console.log(chalk.red('\n❌ Quality checks failed, skipping git operations'));
        pendingChanges.clear();
        return;
      }

      console.log(chalk.green('\n✅ All quality checks passed!'));

      // Get diff for commit message generation
      const diff = getUnstagedDiff();
      const stats = getDiffStats(diff);

      // Generate commit message
      console.log(chalk.blue('\n💭 Generating commit message...'));
      const commitMessage = await generateCommitMessage(diff, config.useAI);

      // Show summary and ask for confirmation
      const details = [
        chalk.green(`📊 Changes: ${stats.added} lines added, ${stats.removed} lines removed`),
        chalk.blue(`💬 Commit message: "${commitMessage}"`),
        chalk.gray(`🌿 Target branch: ${config.branch}`)
      ];

      let shouldCommit = true;
      if (!config.autoConfirm) {
         shouldCommit = await confirmWithDetails(
          '📦 Ready to commit and push',
          details,
          'Commit and push now?',
          true
        );
      } else {
        console.log(chalk.blue('\n📦 Auto-confirming commit and push...'));
        details.forEach(d => console.log(d));
      }

      if (shouldCommit) {
        console.log(chalk.blue('\n🚀 Starting git workflow...'));

        // Stage all changes
        const stageSuccess = await stageAll();
        if (!stageSuccess) {
          console.log(chalk.red('❌ Failed to stage changes'));
          return;
        }

        // Commit changes
        const commitSuccess = await commit(commitMessage);
        if (!commitSuccess) {
          console.log(chalk.red('❌ Failed to commit changes'));
          return;
        }

        // Push changes
        const pushSuccess = await push(config.branch);
        if (!pushSuccess) {
          console.log(chalk.red('❌ Failed to push changes'));
          return;
        }

        console.log(chalk.green.bold('\n🎉 Successfully committed and pushed changes!'));
      } else {
        console.log(chalk.yellow('\n⏭️  Skipping commit and push'));
      }

    } catch (error) {
      console.error(chalk.red(`\n❌ Error processing changes: ${error.message}`));
    } finally {
      pendingChanges.clear();
      console.log(chalk.blue('\n👀 Watching for more changes...\n'));
    }
  }

  /**
   * Handle file change events
   */
  function handleFileChange(path, eventType) {
    const relativePath = relative(process.cwd(), path);
    
    // Log the change
    const icons = {
      add: '➕',
      change: '📝',
      unlink: '➖'
    };
    
    const colors = {
      add: chalk.green,
      change: chalk.yellow,
      unlink: chalk.red
    };

    console.log(colors[eventType](`${icons[eventType]} ${eventType === 'add' ? 'Added' : eventType === 'change' ? 'Modified' : 'Deleted'}: ${relativePath}`));
    
    if (verbose) {
      console.log(chalk.gray(`   Time: ${new Date().toLocaleTimeString()}`));
    }

    // Add to pending changes
    pendingChanges.add(relativePath);

    // Debounce processing
    clearTimeout(changeTimeout);
    changeTimeout = setTimeout(processChanges, 2000); // Wait 2 seconds after last change
  }

  // File change handlers
  watcher
    .on('add', (path) => handleFileChange(path, 'add'))
    .on('change', (path) => handleFileChange(path, 'change'))
    .on('unlink', (path) => handleFileChange(path, 'unlink'))
    .on('addDir', (path) => {
      const relativePath = relative(process.cwd(), path);
      if (verbose) {
        console.log(chalk.blue(`📁 Directory added: ${relativePath}`));
      }
    })
    .on('unlinkDir', (path) => {
      const relativePath = relative(process.cwd(), path);
      if (verbose) {
        console.log(chalk.magenta(`📁 Directory removed: ${relativePath}`));
      }
    })
    .on('error', (error) => {
      console.error(chalk.red(`❌ Watcher error: ${error.message}`));
    })
    .on('ready', () => {
      if (verbose) {
        console.log(chalk.green('✅ Initial scan complete. Ready for changes.\n'));
      }
    });

  // Handle graceful shutdown
  const cleanup = () => {
    console.log(chalk.yellow('\n🛑 Stopping file watcher...'));
    clearTimeout(changeTimeout);
    watcher.close().then(() => {
      console.log(chalk.green('✅ File watcher stopped'));
      process.exit(0);
    });
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return watcher;
}

/**
 * Stop the watcher
 * @param {chokidar.FSWatcher} watcher - The watcher instance to stop
 */
export async function stopWatcher(watcher) {
  if (watcher) {
    await watcher.close();
    console.log(chalk.green('✅ File watcher stopped'));
  }
}

/**
 * Get watcher statistics
 * @param {chokidar.FSWatcher} watcher - The watcher instance
 * @returns {Object} Statistics about watched files
 */
export function getWatcherStats(watcher) {
  if (!watcher) {
    return { watchedPaths: 0, isReady: false };
  }

  const watchedPaths = Object.keys(watcher.getWatched()).length;
  return {
    watchedPaths,
    isReady: watcher.options.ready || false
  };
}