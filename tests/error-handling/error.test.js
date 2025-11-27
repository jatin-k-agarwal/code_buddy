import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the functions to test
import { getConfig } from '../../src/config.js';
import { runTests, runLint } from '../../src/test-runner.js';

describe('Error Handling Tests', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(process.cwd(), 'test-error');
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up
    process.chdir(join(__dirname, '../../'));
    // Add a small delay to prevent EBUSY errors on Windows
    setTimeout(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    }, 100);
  });

  describe('config.js error handling', () => {
    test('should handle missing config files gracefully', () => {
      expect(() => getConfig()).not.toThrow();
    });
  });

  describe('test-runner.js error handling', () => {
    test('should handle missing test commands gracefully', () => {
      expect(() => runTests('nonexistent-command')).not.toThrow();
    });
    test('should handle missing lint commands gracefully', () => {
      expect(() => runLint('nonexistent-command')).not.toThrow();
    });
  });
});
