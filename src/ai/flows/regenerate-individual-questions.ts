// src/ai/flows/regenerate-individual-questions.ts
'use server';
/**
 * @fileOverview Implements the Regenerate Individual Questions AI agent.
 *
 * - regenerateQuestion - A function that handles the regeneration of a single question.
 * - RegenerateQuestionInput - The input type for the regenerateQuestion function.
 * - RegenerateQuestionOutput - The return type for the regenerateQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateQuestionInputSchema = z.object({
  board: z.string().describe('The education board (e.g., CBSE, ICSE, State Board).'),
  classLevel: z.string().describe('The class level (e.g., 10th, 12th).'),
  subject: z.string().describe('The subject of the question (e.g., Mathematics, Science).'),
  chapter: z.string().describe('The chapter from which the question is to be generated.'),
  question: z.string().describe('The question to be regenerated or used as inspiration.'),
  marks: z.number().describe('The marks allocated to the question.'),
});
export type RegenerateQuestionInput = z.infer<typeof RegenerateQuestionInputSchema>;

const RegenerateQuestionOutputSchema = z.object({
  regeneratedQuestion: z.string().describe('The newly generated question.'),
});
export type RegenerateQuestionOutput = z.infer<typeof RegenerateQuestionOutputSchema>;

export async function regenerateQuestion(input: RegenerateQuestionInput): Promise<RegenerateQuestionOutput> {
  return regenerateQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateQuestionPrompt',
  input: {schema: RegenerateQuestionInputSchema},
  output: {schema: RegenerateQuestionOutputSchema},
  prompt: `You are an expert in generating exam questions for Indian school boards.

  Given the following information, regenerate a question that is appropriate for the specified board, class level, subject, and chapter. The regenerated question should be of a similar difficulty and cover the same concepts as the original question, but should not be identical.  The question must be able to be answered correctly for the specified number of marks.

  Board: {{{board}}}
  Class Level: {{{classLevel}}}
  Subject: {{{subject}}}
  Chapter: {{{chapter}}}
  Original Question: {{{question}}}
  Marks: {{{marks}}}

  Regenerated Question:`,
});

const regenerateQuestionFlow = ai.defineFlow(
  {
    name: 'regenerateQuestionFlow',
    inputSchema: RegenerateQuestionInputSchema,
    outputSchema: RegenerateQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
