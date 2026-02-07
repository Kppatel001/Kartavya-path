'use server';

/**
 * @fileOverview Exam paper translation flow.
 *
 * - translateExamPaper - A function that translates an exam paper to a specified language.
 * - TranslateExamPaperInput - The input type for the translateExamPaper function.
 * - TranslateExamPaperOutput - The return type for the translateExamPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateExamPaperInputSchema = z.object({
  examPaper: z.string().describe('The exam paper content to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation (e.g., Hindi, Gujarati).'),
});

export type TranslateExamPaperInput = z.infer<typeof TranslateExamPaperInputSchema>;

const TranslateExamPaperOutputSchema = z.object({
  translatedExamPaper: z.string().describe('The translated exam paper content.'),
});

export type TranslateExamPaperOutput = z.infer<typeof TranslateExamPaperOutputSchema>;

export async function translateExamPaper(input: TranslateExamPaperInput): Promise<TranslateExamPaperOutput> {
  return translateExamPaperFlow(input);
}

const translateExamPaperPrompt = ai.definePrompt({
  name: 'translateExamPaperPrompt',
  input: {schema: TranslateExamPaperInputSchema},
  output: {schema: TranslateExamPaperOutputSchema},
  prompt: `You are an expert translator specializing in educational content.

  Please translate the following exam paper into the specified target language.

  Exam Paper:
  {{examPaper}}

  Target Language: {{targetLanguage}}

  Translation:`, // No Handlebars logic
});

const translateExamPaperFlow = ai.defineFlow(
  {
    name: 'translateExamPaperFlow',
    inputSchema: TranslateExamPaperInputSchema,
    outputSchema: TranslateExamPaperOutputSchema,
  },
  async input => {
    const {output} = await translateExamPaperPrompt(input);
    return output!;
  }
);
