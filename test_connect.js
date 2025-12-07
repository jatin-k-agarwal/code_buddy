
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

const log = (msg) => {
    writeFileSync('connection_result.txt', msg + '\n', { flag: 'a' });
};

async function test() {
    log('Starting test...');
    if (!apiKey) {
        log('Error: No API Key');
        return;
    }
    
    // Check key format
    if (apiKey.startsWith('your_')) {
        log('Error: API Key is placeholder');
        return;
    }
    
    log(`Key: ${apiKey.substring(0, 4)}...`);
    
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        
        log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        log(`Available Models:`);
        if (data.models) {
            data.models.forEach(m => {
                log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            log(JSON.stringify(data, null, 2));
        }
        
    } catch (e) {
        log(`Exception: ${e.message}`);
    }
}

test();
