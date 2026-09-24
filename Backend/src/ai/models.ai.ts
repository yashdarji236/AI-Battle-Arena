import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from '@langchain/groq';
import config from "../config/config.js";

export const geminiModel = new ChatGoogle({
    model: "gemini-flash-latest",
    apiKey: config.GOOGLE_API_KEY,
});

export const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: config.MistralAI_API_KEY || config.GOOGLE_API_KEY,
});

export const cohereModel = new ChatCohere({
    model: 'command-a-03-2025',
    apiKey: config.COHERE_API_KEY,
});

export const groqModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: config.GROQ_API_KEY,
});

export const llamaModel = groqModel;

export const deepseekModel = new ChatOpenAI({
    modelName: "deepseek/deepseek-chat",
    apiKey: config.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});

export const claudeModel = new ChatOpenAI({
    modelName: "anthropic/claude-3.5-haiku",
    apiKey: config.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});

export const gptModel = new ChatOpenAI({
    modelName: "openai/gpt-4o-mini",
    apiKey: config.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});

