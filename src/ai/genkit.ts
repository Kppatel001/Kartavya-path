import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit initialization for Google AI (Gemini).
 * Ensures the API key is explicitly loaded from environment variables.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyDHJ8Q7qgbuudy-zBVBvNtCDKW-Yhq6Hmk';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
