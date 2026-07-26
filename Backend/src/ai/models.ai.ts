import {ChatGoogle} from '@langchain/google'
import {ChatMistralAI} from '@langchain/mistralai'
import { ChatCohere } from '@langchain/cohere'
import config from '../config/config.js'


export const GeminiModel = new ChatGoogle({
    model:"gemini-2.5-flash",
    apiKey:config.GOOGLE_API_KEY
})


export const MistralAiModel = new ChatMistralAI({
    model:"mistral-medium-latest",
    apiKey:config.MistralAI_API_KEY
})


export const coherModel = new ChatCohere({
    model:"command-a-03-2025",
    apiKey:config.COHERE_API_KEY
})

