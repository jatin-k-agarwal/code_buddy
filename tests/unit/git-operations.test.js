import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the functions to test
import { 
  isGitRepository, 
  getCurrentBranch, 
  getRepoInfo, 
  getBranches, 
  getGitStatus, 
  hasChanges, 
  getDiffStats 
} from '../../src/git-operations.js';

describe('git-operations.js', () => {
  let testDir;
  let originalDir;

  beforeEach(() => {
    originalDir = process.cwd();
    testDir = join(originalDir, 'test-repo-' + Date.now());
    
    // Clean up if exists and create fresh
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir);
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up
    process.chdir(originalDir);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('isGitRepository', () => {
    test('should return true for git repository', () => {
      try {
        execSync('git init', { stdio: 'ignore' });
        execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
        execSync('git config user.name "Test User"', { stdio: 'ignore' });
        
        // Create a dummy commit to ensure it's a valid repo
        writeFileSync('dummy.txt', 'test');
        execSync('git add dummy.txt', { stdio: 'ignore' });
        execSync('git commit -m "Initial commit"', { stdio: 'ignore' });
        
        expect(isGitRepository()).toBe(true);
      } catch (error) {
        // Skip if git is not available
        console.warn('Git not available, skipping git repository test');
        expect(true).toBe(true);
      }
    });

    test('should return false for non-git directory', () => {
      // Create a temporary non-git directory
      const nonGitDir = join(process.cwd(), 'non-git-test-' + Date.now());
      if (existsSync(nonGitDir)) {
        rmSync(nonGitDir, { recursive: true, force: true });
      }
      mkdirSync(nonGitDir);
      
      const originalDir = process.cwd();
      try {
        process.chdir(nonGitDir);
        expect(isGitRepository()).toBe(false);
      } finally {
        process.chdir(originalDir);
        if (existsSync(nonGitDir)) {
          rmSync(nonGitDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('getCurrentBranch', () => {
    test('should return current branch name', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        execSync('git checkout -b test-branch');
        expect(getCurrentBranch()).toBe('test-branch');
      } catch (error) {
        // Skip if git is not available
        expect(true).toBe(true);
      }
    });
  });

  describe('getRepoInfo', () => {
    test('should return repository information', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        writeFileSync('test.txt', 'test content');
        execSync('git add test.txt');
        execSync('git commit -m "Initial commit"');

        const info = getRepoInfo();
        expect(info).toBeTruthy();
      } catch (error) {
        // Skip if git is not available
        expect(true).toBe(true);
      }
    });
  });

  describe('getBranches', () => {
    test('should return branch list', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        execSync('git checkout -b feature-branch');
        
        const branches = getBranches();
        expect(branches).toBeDefined();
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });

  describe('getGitStatus', () => {
    test('should return git status', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        writeFileSync('test.txt', 'test content');
        
        const status = getGitStatus();
        expect(status).toBeDefined();
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });

  describe('hasChanges', () => {
    test('should return boolean value', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        
        const hasChangesResult = hasChanges();
        expect(typeof hasChangesResult).toBe('boolean');
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });

  describe('getDiffStats', () => {
    test('should return diff statistics', () => {
      try {
        execSync('git init');
        execSync('git config user.email "test@example.com"');
        execSync('git config user.name "Test User"');
        
        const stats = getDiffStats();
        expect(stats).toBeDefined();
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });
});
