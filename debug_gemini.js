
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in .env');
    process.exit(1);
}

// Check for placeholder
if (apiKey.startsWith('your_') || apiKey.includes('placeholder')) {
    console.error('❌ GEMINI_API_KEY is a placeholder!');
    process.exit(1);
}

async function testModel(modelName) {
    console.log(`\n🧪 Testing model: ${modelName}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say 'Hello' if you can hear me." }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`✅ Success! Response: ${text}`);
            return true;
        } else {
            console.error(`❌ Failed: ${response.status} ${response.statusText}`);
            const err = await response.text();
            console.error(`   Details: ${err}`);
            return false;
        }
    } catch (e) {
        console.error(`❌ Error: ${e.message}`);
        return false;
    }
}

async function run() {
    console.log('🔍 Debugging Gemini API Connection');
    console.log(`🔑 API Key: ${apiKey.substring(0, 5)}...`);
    console.log('-----------------------------------');
    
    // Test 1.5-flash (Standard)
    await testModel('gemini-1.5-flash');
    
    // Test 2.0-flash (Newer/Experimental)
    await testModel('gemini-2.0-flash'); 
}

run();
