import { spawn } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

/**
 * SSH key handler for generating and managing SSH keys
 */
export class SSHHandler {
  constructor() {
    this.sshDir = join(homedir(), '.ssh');
    this.keyName = 'code_buddy_id_ed25519';
    this.privateKeyPath = join(this.sshDir, this.keyName);
    this.publicKeyPath = join(this.sshDir, `${this.keyName}.pub`);
  }

  /**
   * Check if SSH key already exists
   * @returns {boolean} True if key exists
   */
  keyExists() {
    return existsSync(this.privateKeyPath) || existsSync(this.publicKeyPath);
  }

  /**
   * Generate a new SSH key pair
   * @param {string} email - Email for the SSH key
   * @returns {Promise<{success: boolean, message: string, publicKey?: string}>}
   */
  async generateSSHKey(email) {
    try {
      // Ensure .ssh directory exists
      if (!existsSync(this.sshDir)) {
        mkdirSync(this.sshDir, { mode: 0o700 });
      }

      // Check if key already exists
      if (this.keyExists()) {
        return {
          success: false,
          message: `SSH key already exists at ${this.privateKeyPath}. Use a different name or remove existing key.`
        };
      }

      console.log(chalk.blue('🔐 Generating new SSH key pair...'));

      // Generate SSH key using ssh-keygen
      const command = 'ssh-keygen';
      const args = [
        '-t', 'ed25519',
        '-f', this.privateKeyPath,
        '-C', email,
        '-N', '' // No passphrase
      ];

      const result = await this.runCommand(command, args);
      
      if (!result.success) {
        return {
          success: false,
          message: `Failed to generate SSH key: ${result.error}`
        };
      }

      // Read the public key
      const publicKey = readFileSync(this.publicKeyPath, 'utf8').trim();

      // Add to ssh-agent
      const addResult = await this.addToSSHAgent();
      if (!addResult.success) {
        console.log(chalk.yellow(`⚠️  Warning: ${addResult.message}`));
      }

      return {
        success: true,
        message: 'SSH key generated successfully',
        publicKey
      };

    } catch (error) {
      return {
        success: false,
        message: `Error generating SSH key: ${error.message}`
      };
    }
  }

  /**
   * Add SSH key to ssh-agent
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async addToSSHAgent() {
    try {
      // Check if ssh-agent is running
      const agentCheck = await this.runCommand('ssh-add', ['-l']);
      if (!agentCheck.success && !agentCheck.error.includes('no identities')) {
        return {
          success: false,
          message: 'ssh-agent is not running. Please start it manually.'
        };
      }

      // Add the key to ssh-agent
      const addResult = await this.runCommand('ssh-add', [this.privateKeyPath]);
      
      if (addResult.success) {
        return {
          success: true,
          message: 'SSH key added to ssh-agent'
        };
      } else {
        return {
          success: false,
          message: `Failed to add key to ssh-agent: ${addResult.error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error adding key to ssh-agent: ${error.message}`
      };
    }
  }

  /**
   * Display setup instructions
   * @param {string} publicKey - The public key to display
   */
  displaySetupInstructions(publicKey) {
    console.log(chalk.green.bold('\n🎉 SSH Key Setup Complete!\n'));
    console.log(chalk.blue('📋 Your new public key:'));
    console.log(chalk.yellow(publicKey));
    console.log('\n' + chalk.cyan('🔗 Next steps:'));
    console.log(chalk.white('1. Copy the public key above'));
    console.log(chalk.white('2. Go to GitHub SSH settings: https://github.com/settings/keys'));
    console.log(chalk.white('3. Click "New SSH key"'));
    console.log(chalk.white('4. Paste your key and give it a title'));
    console.log(chalk.white('5. Click "Add SSH key"\n'));
    console.log(chalk.gray('💡 You can test your connection with: ssh -T git@github.com'));
  }

  /**
   * Run a command and return the result
   * @param {string} command - Command to run
   * @param {string[]} args - Command arguments
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async runCommand(command, args = []) {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true
      });

      let errorOutput = '';
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          error: errorOutput.trim()
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
    });
  }

  /**
   * Get existing SSH keys
   * @returns {Array<string>} List of existing SSH keys
   */
  getExistingKeys() {
    try {
      const files = readdirSync(this.sshDir);
      return files.filter(file => 
        file.endsWith('.pub') || (!file.endsWith('.pub') && !file.includes('known_hosts'))
      );
    } catch (error) {
      return [];
    }
  }
}
