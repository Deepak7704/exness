import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const agentConfig = {
  modelName: 'gemini-2.5-flash',
  temperature: 0.3,
  maxOutputTokens: 2048,
  maxIterations: 5,
  verbose: true,
};

export function createModel() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not found in environment variables');
  }

  console.log("Initializing Gemini model:", agentConfig.modelName);

  return new ChatGoogleGenerativeAI({
    model: agentConfig.modelName,
    temperature: agentConfig.temperature,
    maxOutputTokens: agentConfig.maxOutputTokens,
    apiKey: process.env.GOOGLE_API_KEY,
    streaming: false,
  });
}