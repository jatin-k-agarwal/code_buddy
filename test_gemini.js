import dotenv from 'dotenv';
import { generateCommitMessage } from './src/commit-message.js';
import chalk from 'chalk';

// Force load .env
dotenv.config();

console.log('Testing Gemini API connection...');

if (!process.env.GEMINI_API_KEY) {
    console.error(chalk.red('❌ GEMINI_API_KEY not found in environment variables.'));
    process.exit(1);
} else {
    console.log(chalk.green('✅ GEMINI_API_KEY found in environment.'));
}

    // Generate message
    const diff = `diff --git a/test.txt b/test.txt
index e69de29..d38721a 100644
--- a/test.txt
+++ b/test.txt
@@ -0,0 +1 @@
+This is a test change to verify Gemini API.`;

    const message = await generateCommitMessage(diff, true); 
    
    console.log('\nGenerated Message:');
    console.log(message);
    
    if (message.includes('Update files') && !message.includes('Gemini')) {
         // Fallback was likely used
         console.log('Fallback used.');
    }

