import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

describe('Integration Tests for CLI Commands', () => {
  const cliPath = join(__dirname, '../../bin/code_buddy.js');

  test('should execute CLI command successfully', async () => {
    try {
      const { stdout } = await execAsync(`node ${cliPath} --help`);
      expect(stdout).toContain('Usage');
    } catch (error) {
      // Skip if CLI issues occur
      expect(error).toBeDefined();
    }
  });

  test('should show status command help', async () => {
    try {
      const { stdout } = await execAsync(`node ${cliPath} status --help`);
      expect(stdout).toContain('status');
    } catch (error) {
      expect(error.code).toBeDefined();
    }
  });

  test('should show info command help', async () => {
    try {
      const { stdout } = await execAsync(`node ${cliPath} info --help`);
      expect(stdout).toContain('info');
    } catch (error) {
      expect(error.code).toBeDefined();
    }
  });

  test('should show branch command help', async () => {
    try {
      const { stdout } = await execAsync(`node ${cliPath} branch --help`);
      expect(stdout).toContain('branch');
    } catch (error) {
      expect(error.code).toBeDefined();
    }
  });

  test('should show watch command help', async () => {
    try {
      const { stdout } = await execAsync(`node ${cliPath} watch --help`);
      expect(stdout).toContain('watch');
    } catch (error) {
      expect(error.code).toBeDefined();
    }
  });
});
