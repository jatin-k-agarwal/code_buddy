import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateCommitMessage, getAvailableProviders } from '../../src/commit-message.js';

describe('AI Providers', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getAvailableProviders', () => {
    it('should return all providers with availability status', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const providers = getAvailableProviders();
      
      expect(providers).toHaveLength(3);
      expect(providers[0]).toMatchObject({
        key: 'openai',
        name: 'OpenAI',
        available: true
      });
      expect(providers[1]).toMatchObject({
        key: 'gemini',
        name: 'Gemini',
        available: true
      });
      expect(providers[2]).toMatchObject({
        key: 'addisai',
        name: 'Addis AI',
        available: false
      });
    });
  });

  describe('AI provider priority', () => {
    it('should prioritize OpenAI when available', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const providers = getAvailableProviders();
      const availableProvider = providers.find(p => p.available);
      
      expect(availableProvider.key).toBe('openai');
    });

    it('should use Gemini when OpenAI is not available', () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const providers = getAvailableProviders();
      const availableProvider = providers.find(p => p.available);
      
      expect(availableProvider.key).toBe('gemini');
    });

    it('should use Addis AI when only it is available', () => {
      process.env.ADDIS_AI_API_KEY = 'test-addis-ai-key';
      
      const providers = getAvailableProviders();
      const availableProvider = providers.find(p => p.available);
      
      expect(availableProvider.key).toBe('addisai');
    });
  });
});
