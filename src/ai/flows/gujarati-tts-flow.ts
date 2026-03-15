
'use server';

/**
 * @fileOverview Gujarati Text-to-Speech flow.
 * Converts Gujarati concept explanations into voice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const GujaratiTTSInputSchema = z.object({
  text: z.string().describe('The Gujarati text to convert to speech.'),
});

export type GujaratiTTSInput = z.infer<typeof GujaratiTTSInputSchema>;

const GujaratiTTSOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a WAV data URI.'),
});

export type GujaratiTTSOutput = z.infer<typeof GujaratiTTSOutputSchema>;

export async function gujaratiTTS(input: GujaratiTTSInput): Promise<GujaratiTTSOutput> {
  return gujaratiTTSFlow(input);
}

const gujaratiTTSFlow = ai.defineFlow(
  {
    name: 'gujaratiTTSFlow',
    inputSchema: GujaratiTTSInputSchema,
    outputSchema: GujaratiTTSOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `તમે એક નિષ્ણાત શિક્ષક છો. આ ગુજરાતી લખાણને સ્પષ્ટ અને પ્રેમાળ અવાજમાં બોલો: ${input.text}`,
    });

    if (!media || !media.url) {
      throw new Error('No audio media returned from Genkit');
    }

    const base64Audio = media.url.substring(media.url.indexOf(',') + 1);
    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    
    const wavBase64 = await toWav(pcmBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
