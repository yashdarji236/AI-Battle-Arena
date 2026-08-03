import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    MistralAI_API_KEY: process.env.MISTRAL_API_KEY || '',
    COHERE_API_KEY: process.env.COHERE_API_KEY || '',
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API || '',
    GITHUB_API_KEY: process.env.GITHUB_API_KEY || process.env.GITHUB_TOKEN || '',
    MONGO_URL: process.env.MONGO_URL || ''
};

export default config;