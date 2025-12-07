import OpenAI from 'openai';
import chalk from 'chalk';
import { getDiffStats } from './git-operations.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// AI Provider configurations
const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    model: 'gpt-3.5-turbo',
    baseURL: null
  },
  gemini: {
    name: 'Gemini',
    envKey: 'GEMINI_API_KEY',
    model: 'gemini-2.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta'
  },
  addisai: {
    name: 'Addis AI',
    envKey: 'ADDIS_AI_API_KEY',
    model: 'addis-ai-local',
    baseURL: null
  }
};

/**
 * Generate a commit message based on git diff
 * @param {string} diff - Git diff output
 * @param {boolean} useAI - Whether to use AI for generation
 * @returns {Promise<string>} Generated commit message
 */
export async function generateCommitMessage(diff, useAI = false) {
  if (!diff || diff.trim() === '') {
    return 'Update files';
  }

  if (useAI) {
    return await generateAICommitMessage(diff);
  } else {
    return generateFallbackCommitMessage(diff);
  }
}

/**
 * Generate commit message using available AI provider
 * @param {string} diff - Git diff output
 * @returns {Promise<string>} AI-generated commit message
 */
async function generateAICommitMessage(diff) {
  // Determine which AI provider to use based on available API keys
  const availableProvider = getAvailableAIProvider();
  
  if (!availableProvider) {
    console.log(chalk.yellow('⚠️  No AI API keys found in environment, using fallback'));
    return generateFallbackCommitMessage(diff);
  }

  try {
    console.log(chalk.blue(`🤖 Generating AI commit message using ${availableProvider.name}...`));
    
    switch (availableProvider.key) {
      case 'openai':
        return await generateOpenAICommitMessage(diff, availableProvider.config);
      case 'gemini':
        return await generateGeminiCommitMessage(diff, availableProvider.config);
      case 'addisai':
        return await generateAddisAICommitMessage(diff, availableProvider.config);
      default:
        return generateFallbackCommitMessage(diff);
    }
  } catch (error) {
    console.error(chalk.red(`❌ AI generation failed: ${error.message}`));
    console.log(chalk.yellow('🔄 Using fallback commit message'));
    return generateFallbackCommitMessage(diff);
  }
}

/**
 * Get available AI provider based on environment variables
 * @returns {Object|null} Available provider info or null if none found
 */
function getAvailableAIProvider() {
  // Check providers in priority order: OpenAI, Gemini, Addis AI
  const providers = ['openai', 'gemini', 'addisai'];
  
  for (const providerKey of providers) {
    const config = AI_PROVIDERS[providerKey];
    const apiKey = process.env[config.envKey];
    
    // Check if key is valid (not empty and not a placeholder)
    if (apiKey && apiKey.trim() && !apiKey.startsWith('your_') && !apiKey.includes('placeholder')) {
      return {
        key: providerKey,
        name: config.name,
        config: {
          apiKey,
          model: config.model,
          baseURL: config.baseURL
        }
      };
    }
  }
  
  return null;
}

/**
 * Generate commit message using OpenAI
 * @param {string} diff - Git diff output
 * @param {Object} config - Provider configuration
 * @returns {Promise<string>} AI-generated commit message
 */
async function generateOpenAICommitMessage(diff, config) {
  const openai = new OpenAI({
    apiKey: config.apiKey
  });

  const prompt = `Based on the following git diff, generate a concise, conventional commit message. 
The message should:
- Follow conventional commit format (type: description)
- Be under 50 characters for the subject line
- Clearly describe what changed
- Use present tense

Git diff:
${diff}

Generate only the commit message, nothing else.`;

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates concise, conventional git commit messages based on code diffs.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 100,
    temperature: 0.3
  });

  const message = response.choices[0]?.message?.content?.trim();
  
  if (message) {
    console.log(chalk.green(`✅ ${AI_PROVIDERS.openai.name} commit message generated`));
    return message;
  } else {
    console.log(chalk.yellow('⚠️  AI response was empty, using fallback'));
    return generateFallbackCommitMessage(diff);
  }
}

/**
 * Generate commit message using Gemini
 * @param {string} diff - Git diff output
 * @param {Object} config - Provider configuration
 * @returns {Promise<string>} AI-generated commit message
 */
async function generateGeminiCommitMessage(diff, config) {
  const prompt = `Based on the following git diff, generate a concise, conventional commit message. 
The message should:
- Follow conventional commit format (type: description)
- Be under 50 characters for the subject line
- Clearly describe what changed
- Use present tense

Git diff:
${diff}

Generate only the commit message, nothing else.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3
          }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    console.log(chalk.gray(`[Debug] Gemini response received, parsing...`));
    
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (message) {
      console.log(chalk.green(`✅ ${AI_PROVIDERS.gemini.name} commit message generated`));
      return message;
    } else {
      console.log(chalk.yellow('⚠️  Gemini response was empty, using fallback'));
      console.log(chalk.gray(`[Debug] Response data: ${JSON.stringify(data)}`));
      return generateFallbackCommitMessage(diff);
    }
  } catch (error) {
    console.error(chalk.red(`[Gemini Error] ${error.message}`));
    throw error; // Re-throw so parent catch handler can log it
  }
}

/**
 * Generate commit message using Addis AI
 * @param {string} diff - Git diff output
 * @param {Object} config - Provider configuration
 * @returns {Promise<string>} AI-generated commit message
 */
async function generateAddisAICommitMessage(diff, config) {
  // Addis AI supports local languages like Afaan Oromo and Amharic
  const prompt = `Based on the following git diff, generate a concise commit message.
The message should:
- Be brief and clear
- Describe what changed
- Support local languages (Afaan Oromo, Amharic) if appropriate

Git diff:
${diff}

Generate only the commit message, nothing else.`;

  // For Addis AI, we'll use a similar API structure as OpenAI
  // This assumes Addis AI uses OpenAI-compatible API format
  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL || 'https://api.addisai.com/v1'
  });

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates concise git commit messages based on code diffs. Support local languages when appropriate.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 100,
    temperature: 0.3
  });

  const message = response.choices[0]?.message?.content?.trim();
  
  if (message) {
    console.log(chalk.green(`✅ ${AI_PROVIDERS.addisai.name} commit message generated`));
    return message;
  } else {
    console.log(chalk.yellow('⚠️  Addis AI response was empty, using fallback'));
    return generateFallbackCommitMessage(diff);
  }
}

/**
 * Generate fallback commit message based on diff statistics
 * @param {string} diff - Git diff output
 * @returns {string} Fallback commit message
 */
function generateFallbackCommitMessage(diff) {
  const stats = getDiffStats(diff);
  
  if (stats.added === 0 && stats.removed === 0) {
    return 'Update files';
  }
  
  const parts = [];
  if (stats.added > 0) {
    parts.push(`${stats.added} lines added`);
  }
  if (stats.removed > 0) {
    parts.push(`${stats.removed} lines removed`);
  }
  
  return `Update files — ${parts.join(', ')}`;
}

/**
 * Validate commit message format
 * @param {string} message - Commit message to validate
 * @returns {boolean} True if message is valid
 */
export function validateCommitMessage(message) {
  if (!message || message.trim().length === 0) {
    return false;
  }
  
  // Basic validation - not empty and reasonable length
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/**
 * Format commit message for display
 * @param {string} message - Commit message
 * @returns {string} Formatted message
 */
export function formatCommitMessage(message) {
  const lines = message.split('\n');
  const subject = lines[0];
  const body = lines.slice(1).join('\n').trim();
  
  let formatted = chalk.bold(subject);
  if (body) {
    formatted += '\n' + chalk.gray(body);
  }
  
  return formatted;
}

/**
 * Get available AI providers for display purposes
 * @returns {Array} List of available AI providers
 */
export function getAvailableProviders() {
  return Object.entries(AI_PROVIDERS).map(([key, provider]) => ({
    key,
    name: provider.name,
    envKey: provider.envKey,
    available: !!process.env[provider.envKey]
  }));
}
