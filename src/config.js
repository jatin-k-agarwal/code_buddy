import { cosmiconfigSync } from 'cosmiconfig';
import chalk from 'chalk';

// The name of the tool, used for finding config files
const moduleName = 'code_buddy';

// Default configuration
const defaultConfig = {
  branch: 'main',
  runTests: true,
  runLint: true,
  useAI: false,
  testCommand: 'npm test',
  lintCommand: 'npm run lint',
  watchIgnore: [], // User-defined ignores
};

// Initialize cosmiconfig to search for our config files
const explorer = cosmiconfigSync(moduleName, {
  searchPlaces: [
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    // For backward compatibility, also search for the old name
    '.gitassistrc',
    '.gitassistrc.json',
  ],
});

/**
 * Get the final configuration by merging defaults with user-defined config.
 * @returns {object} The final configuration object.
 */
export function getConfig() {
  const result = explorer.search();
  const userConfig = result ? result.config : {};

  if (result && result.filepath.includes('gitassist')) {
    console.log(chalk.yellow.bold(`\n[code_buddy Warning] Found legacy '.gitassistrc' config file. Please rename it to '.code_buddyrc.json' for future compatibility.\n`));
  }

  return { ...defaultConfig, ...userConfig };
}