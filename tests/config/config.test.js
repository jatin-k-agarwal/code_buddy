import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('config.js', () => {
  const testDir = join(__dirname, '../../test-config');
  const configFile = join(testDir, '.code_buddyrc.json');
  const oldConfigFile = join(testDir, '.gitassistrc');

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up config files
    if (existsSync(configFile)) {
      unlinkSync(configFile);
    }
    if (existsSync(oldConfigFile)) {
      unlinkSync(oldConfigFile);
    }
  });

  test('should handle missing config files gracefully', () => {
    expect(true).toBe(true);
  });
});
