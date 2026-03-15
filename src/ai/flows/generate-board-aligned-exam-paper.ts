
'use server';
/**
 * @fileOverview A flow to generate board-aligned exam papers for Gujarat Schools (GSEB focus).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBoardAlignedExamPaperInputSchema = z.object({
  state: z.string().default('Gujarat'),
  board: z.string().describe('The board for the exam paper (e.g., "GSEB").'),
  classLevel: z.string().describe('The class level for the exam paper (e.g., "10").'),
  subject: z.string().describe('The subject for the exam paper (e.g., "Mathematics").'),
  chapters: z.string().describe('The chapters to include in the exam paper.'),
  totalMarks: z.number().describe('The total marks for the exam paper.'),
  language: z.string().optional().describe('The language for the exam paper. Defaults to Gujarati.'),
  blueprintText: z.string().optional().describe('Extracted blueprint text or manual blueprint description.'),
});

export type GenerateBoardAlignedExamPaperInput = z.infer<typeof GenerateBoardAlignedExamPaperInputSchema>;

const GenerateBoardAlignedExamPaperOutputSchema = z.object({
  examPaper: z.string().describe('The generated exam paper in a printable format.'),
});

export type GenerateBoardAlignedExamPaperOutput = z.infer<typeof GenerateBoardAlignedExamPaperOutputSchema>;

export async function generateBoardAlignedExamPaper(input: GenerateBoardAlignedExamPaperInput): Promise<GenerateBoardAlignedExamPaperOutput> {
  return generateBoardAlignedExamPaperFlow(input);
}

const generateBoardAlignedExamPaperPrompt = ai.definePrompt({
  name: 'generateBoardAlignedExamPaperPrompt',
  input: {schema: GenerateBoardAlignedExamPaperInputSchema},
  output: {schema: GenerateBoardAlignedExamPaperOutputSchema},
  prompt: `You are an expert in generating board-aligned exam papers for Gujarat Secondary and Higher Secondary Education Board (GSEB).

Generate a complete exam paper based on these details:
State: Gujarat
Board: {{{board}}}
Class: {{{classLevel}}}
Subject: {{{subject}}}
Chapters: {{{chapters}}}
Total Marks: {{{totalMarks}}}
Language: {{{language}}}

{{#if blueprintText}}
Syllabus / Blueprint Details:
{{{blueprintText}}}
{{/if}}

The exam paper must follow a clean, structured format:

1. STRUCTURE (GSEB Pattern):
   - વિભાગ A (Section A): હેતુલક્ષી પ્રશ્નો (MCQs, True/False, Fill in the blanks) - 1 mark each.
   - વિભાગ B (Section B): ટૂંક જવાબી પ્રશ્નો (Short Answer) - 2 marks each.
   - વિભાગ C (Section C): સવિસ્તાર પ્રશ્નો (Descriptive) - 3 marks each.
   - વિભાગ D (Section D): લાંબા પ્રશ્નો (Long Answer / Essays) - 4 or 5 marks each.

2. FORMATTING RULES:
   - Use clear headers for each section, e.g., "--- વિભાગ A ---".
   - Under each section header, include a short instruction in Gujarati, e.g., "નીચેના પ્રશ્નોના માગ્યા મુજબ ઉત્તર આપો."
   - Number each question clearly (1, 2, 3...).
   - Ensure the marks distribution matches the totalMarks provided.
   - Use standard GCERT/GSEB terminology.
   - Ensure a clean line spacing between questions.

3. ANSWER KEY REQUIREMENT:
   At the very end of the paper, add "--- જવાબવહી / ઉત્તરવલી (Answer Key) ---".
   Provide step-by-step solutions for Section B, C, and D based on marks.

Output the content in শુદ્ધ Gujarati, with a structure that is easy to read and print.`,
});

const generateBoardAlignedExamPaperFlow = ai.defineFlow(
  {
    name: 'generateBoardAlignedExamPaperFlow',
    inputSchema: GenerateBoardAlignedExamPaperInputSchema,
    outputSchema: GenerateBoardAlignedExamPaperOutputSchema,
  },
  async input => {
    const {output} = await generateBoardAlignedExamPaperPrompt(input);
    return output!;
  }
);
