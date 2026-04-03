
'use server';

/**
 * @fileOverview Consolidated AI flows for Kartavya Path.
 * All AI logic is executed on the server side for security and performance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// --- 1. Exam Paper Generation ---

const GeneratePaperInputSchema = z.object({
  state: z.string().default('Gujarat'),
  board: z.string(),
  classLevel: z.string(),
  subject: z.string(),
  chapters: z.string(),
  totalMarks: z.number(),
  language: z.string().optional(),
  blueprintText: z.string().optional(),
  examType: z.string().optional(),
});

export type GeneratePaperInput = z.infer<typeof GeneratePaperInputSchema>;

const GeneratePaperOutputSchema = z.object({
  examPaper: z.string(),
});

const generatePaperPrompt = ai.definePrompt({
  name: 'generatePaperPrompt',
  input: { schema: GeneratePaperInputSchema },
  output: { schema: GeneratePaperOutputSchema },
  prompt: `You are an expert GSEB/GCERT exam paper generator.
  Generate a professional exam paper in Gujarati for:
  Subject: {{subject}}, Class: {{classLevel}}, Board: {{board}}, Marks: {{totalMarks}}.
  Chapters: {{chapters}}
  Language: {{language}}
  
  Rules:
  - Sum of marks must be exactly {{totalMarks}}.
  - Use standard Gujarati headings like "વિભાગ A", "કુલ ગુણ", etc.
  - Include an Answer Key at the end with "--- જવાબવહી (Answer Key) ---".
  {{#if blueprintText}}Manual Blueprint: {{blueprintText}}{{/if}}`,
});

export async function generateBoardAlignedExamPaper(input: GeneratePaperInput) {
  const { output } = await generatePaperPrompt(input);
  return { success: true, examPaper: output?.examPaper };
}

// --- 2. Blueprint Extraction ---

const ExtractBlueprintInputSchema = z.object({
  fileDataUri: z.string().describe("Data URI of the document/image."),
});

const ExtractBlueprintOutputSchema = z.object({
  extractedBlueprint: z.string(),
});

const extractBlueprintPrompt = ai.definePrompt({
  name: 'extractBlueprintPrompt',
  input: { schema: ExtractBlueprintInputSchema },
  output: { schema: ExtractBlueprintOutputSchema },
  prompt: `Analyze this exam blueprint document: {{media url=fileDataUri}}
  Extract sections, question types, and marking scheme.`,
});

export async function extractBlueprint(input: { fileDataUri: string }) {
  const { output } = await extractBlueprintPrompt(input);
  return { extractedBlueprint: output?.extractedBlueprint || "" };
}

// --- 3. Translation ---

const TranslateInputSchema = z.object({
  examPaper: z.string(),
  targetLanguage: z.string(),
});

const TranslateOutputSchema = z.object({
  translatedExamPaper: z.string(),
});

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `Translate this exam paper to {{targetLanguage}}:
  {{examPaper}}`,
});

export async function translateExamPaper(input: { examPaper: string, targetLanguage: string }) {
  const { output } = await translatePrompt(input);
  return { translatedExamPaper: output?.translatedExamPaper || "" };
}

// --- 4. Socratic Tutor ---

const TutorInputSchema = z.object({
  subject: z.string(),
  classLevel: z.string(),
  question: z.string(),
  studentQuery: z.string(),
  history: z.array(z.object({ role: z.enum(['user', 'model']), text: z.string() })).optional(),
});

const TutorOutputSchema = z.object({
  response: z.string(),
});

const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorInputSchema },
  output: { schema: TutorOutputSchema },
  prompt: `You are 'Vidya', a Socratic Tutor for GSEB students. 
  Subject: {{subject}}, Class: {{classLevel}}.
  Context: {{question}}
  Student says: {{studentQuery}}
  
  Do NOT give the answer. Ask guiding questions in pure Gujarati.`,
});

export async function socraticTutor(input: z.infer<typeof TutorInputSchema>) {
  const { output } = await tutorPrompt(input);
  return { response: output?.response || "" };
}

// --- 5. Gujarati TTS ---

export async function gujaratiTTS(input: { text: string }) {
  const { media } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
    },
    prompt: `તમે એક નિષ્ણાત શિક્ષક છો. આ ગુજરાતી લખાણને સ્પષ્ટ અને પ્રેમાળ અવાજમાં બોલો: ${input.text}`,
  });

  if (!media || !media.url) throw new Error('TTS Failed');

  const base64Audio = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(base64Audio, 'base64');
  const wavBase64 = await toWav(pcmBuffer);

  return { audioDataUri: 'data:audio/wav;base64,' + wavBase64 };
}

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}
