import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit initialization for Google AI (Gemini).
 * API key is loaded strictly from environment variables on the server.
 * Force server reload to pick up updated .env.local variables.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Critical Error: GEMINI_API_KEY is not defined in environment variables.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
