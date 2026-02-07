'use server';
/**
 * @fileOverview A flow to generate board-aligned exam papers.
 *
 * - generateBoardAlignedExamPaper - A function that generates an exam paper based on user-specified criteria.
 * - GenerateBoardAlignedExamPaperInput - The input type for the generateBoardAlignedExamPaper function.
 * - GenerateBoardAlignedExamPaperOutput - The return type for the generateBoardAlignedExamPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBoardAlignedExamPaperInputSchema = z.object({
  state: z.string().describe('The state for the exam paper (e.g., "Maharashtra").'),
  board: z.string().describe('The board for the exam paper (e.g., "CBSE").'),
  classLevel: z.string().describe('The class level for the exam paper (e.g., "10").'),
  subject: z.string().describe('The subject for the exam paper (e.g., "Mathematics").'),
  chapters: z.string().describe('The chapters to include in the exam paper (e.g., "Chapter 1, Chapter 2").'),
  totalMarks: z.number().describe('The total marks for the exam paper.'),
  language: z.string().optional().describe('The language for the exam paper (e.g., "English", "Hindi"). Defaults to English.'),
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
  prompt: `You are an expert in generating board-aligned exam papers for Indian schools.

You will generate a complete exam paper based on the following information:

State: {{{state}}}
Board: {{{board}}}
Class: {{{classLevel}}}
Subject: {{{subject}}}
Chapters: {{{chapters}}}
Total Marks: {{{totalMarks}}}
Language: {{{language}}}

The exam paper should:
- Be in the appropriate format for the specified board.
- Cover the specified chapters.
- Have a total mark distribution that matches the specified total marks.
- Include clear instructions for each section.
- Prevent repeated question patterns.
- Be suitable for printing and distribution to students.
- Adapt to different board styles (CBSE competency-based, State Board textbook-based, ICSE descriptive, etc.).

Output the complete exam paper in a printable format. Ensure correct mark distribution.
`,
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
