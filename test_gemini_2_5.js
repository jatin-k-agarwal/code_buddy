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
    writeFileSync('gemini_2_5_test.txt', msg + '\n', { flag: 'a' });
};

async function test() {
    log('Testing gemini-2.5-flash...');
    
    if (!apiKey) {
        log('❌ No API Key found');
        return;
    }
    
    if (apiKey.startsWith('your_')) {
        log('❌ API Key is placeholder');
        return;
    }
    
    log(`✅ Key found: ${apiKey.substring(0, 5)}...`);
    
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say 'Hello World' if you can hear me." }] }]
            })
        });
        
        log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            log(`✅ SUCCESS! Response: ${text}`);
        } else {
            const errorText = await response.text();
            log(`❌ FAILED: ${errorText}`);
        }
        
    } catch (e) {
        log(`❌ Exception: ${e.message}`);
    }
}

test();
