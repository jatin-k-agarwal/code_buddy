import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

const log = (msg) => {
    console.log(msg);
    writeFileSync('api_test_result.txt', msg + '\n', { flag: 'a' });
};

async function test() {
    log('🔍 Testing NEW Gemini API Key with gemini-2.5-flash...');
    log('================================================');
    
    if (!apiKey) {
        log('❌ FAILED: No API Key found in .env');
        return;
    }
    
    if (apiKey.startsWith('your_') || apiKey.includes('placeholder')) {
        log('❌ FAILED: API Key appears to be a placeholder');
        return;
    }
    
    log(`✅ API Key detected: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    log(`\n🌐 Calling Gemini API...`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Say 'Hello! I am working!' if you can hear me."
                    }]
                }]
            })
        });
        
        log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            log(`\n✅ SUCCESS! Gemini responded:`);
            log(`💬 "${text}"`);
            log(`\n🎉 Your new API key is WORKING PERFECTLY!`);
        } else {
            const errorText = await response.text();
            log(`\n❌ FAILED with error:`);
            log(errorText);
        }
        
    } catch (e) {
        log(`\n❌ Exception occurred: ${e.message}`);
    }
}

test();
