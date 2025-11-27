import readline from 'readline';
import chalk from 'chalk';

/**
 * Create readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user a yes/no question
 * @param {string} question - Question to ask
 * @param {boolean} defaultAnswer - Default answer if user just presses enter
 * @returns {Promise<boolean>} User's answer
 */
export function askYesNo(question, defaultAnswer = true) {
  return new Promise((resolve) => {
    const rl = createInterface();
    const defaultText = defaultAnswer ? '[Y/n]' : '[y/N]';
    const prompt = `${question} ${defaultText} `;
    
    rl.question(chalk.cyan(prompt), (answer) => {
      rl.close();
      
      const normalized = answer.toLowerCase().trim();
      
      if (normalized === '') {
        resolve(defaultAnswer);
      } else if (normalized === 'y' || normalized === 'yes') {
        resolve(true);
      } else if (normalized === 'n' || normalized === 'no') {
        resolve(false);
      } else {
        // Invalid input, ask again
        console.log(chalk.yellow('Please answer with y/yes or n/no'));
        resolve(askYesNo(question, defaultAnswer));
      }
    });
  });
}

/**
 * Ask user for text input
 * @param {string} question - Question to ask
 * @param {string} defaultValue - Default value if user just presses enter
 * @returns {Promise<string>} User's input
 */
export function askText(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = createInterface();
    const defaultText = defaultValue ? `[${defaultValue}]` : '';
    const prompt = `${question} ${defaultText}: `;
    
    rl.question(chalk.cyan(prompt), (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Ask user to select from multiple options
 * @param {string} question - Question to ask
 * @param {Array<string>} options - Available options
 * @param {number} defaultIndex - Default option index
 * @returns {Promise<string>} Selected option
 */
export function askChoice(question, options, defaultIndex = 0) {
  return new Promise((resolve) => {
    console.log(chalk.cyan(question));
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? '→' : ' ';
      console.log(chalk.gray(`${marker} ${index + 1}. ${option}`));
    });
    
    const rl = createInterface();
    const prompt = `Select option (1-${options.length}) [${defaultIndex + 1}]: `;
    
    rl.question(chalk.cyan(prompt), (answer) => {
      rl.close();
      
      const choice = parseInt(answer.trim()) - 1;
      
      if (isNaN(choice) || choice < 0 || choice >= options.length) {
        if (answer.trim() === '') {
          resolve(options[defaultIndex]);
        } else {
          console.log(chalk.yellow('Invalid choice, please try again'));
          resolve(askChoice(question, options, defaultIndex));
        }
      } else {
        resolve(options[choice]);
      }
    });
  });
}

/**
 * Display a confirmation prompt with details
 * @param {string} title - Title of the confirmation
 * @param {Array<string>} details - Details to show
 * @param {string} question - Question to ask
 * @param {boolean} defaultAnswer - Default answer
 * @returns {Promise<boolean>} User's confirmation
 */
export function confirmWithDetails(title, details, question, defaultAnswer = true) {
  console.log(chalk.blue.bold(`\n${title}`));
  console.log(chalk.gray('─'.repeat(50)));
  
  details.forEach(detail => {
    console.log(detail);
  });
  
  console.log(chalk.gray('─'.repeat(50)));
  
  return askYesNo(question, defaultAnswer);
}

/**
 * Show a loading spinner while executing an async operation
 * @param {string} message - Loading message
 * @param {Function} operation - Async operation to execute
 * @returns {Promise<any>} Result of the operation
 */
export async function withSpinner(message, operation) {
  const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.blue(spinner[i])} ${message}`);
    i = (i + 1) % spinner.length;
  }, 100);
  
  try {
    const result = await operation();
    clearInterval(interval);
    process.stdout.write(`\r${chalk.green('✅')} ${message}\n`);
    return result;
  } catch (error) {
    clearInterval(interval);
    process.stdout.write(`\r${chalk.red('❌')} ${message}\n`);
    throw error;
  }
}