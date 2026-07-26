import { MistralAI } from '@langchain/mistralai'
import dotenv from 'dotenv'
dotenv.config()


const config = {
    GOOGLE_API_KEY:process.env.GOOGLE_API_KEY || '',
    MistralAI_API_KEY:process.env.MISTRAL_API_KEY || '',
    COHERE_API_KEY:process.env.COHERE_API_KEY || '',
    GROQ_API_KEY:process.env.GROQ_API_KEY || '',
    DEEPSEEK_API_KEY:process.env.DEEPSEEK_API_KEY || ''

    
}

export default config