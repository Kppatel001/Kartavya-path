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

The exam paper must:
- Strictly follow the official GSEB paper pattern for the specified class and subject.
- Be entirely in the requested language (primary is Gujarati).
- Include standard GSEB sections (e.g., Section A, B, C, D).
- Ensure mark distribution is accurate to the total marks.
- Include instructions like "બધા પ્રશ્નો ફરજિયાત છે" (All questions are compulsory).
- Use terminology from GCERT/GSEB textbooks.
- Provide clear questions for each section (MCQs, VSA, SA, LA).

CRITICAL REQUIREMENT FOR ANSWER KEY:
At the very end of the paper, after all questions, add a section called "--- જવાબવહી / ઉત્તરવલી (Answer Key) ---". 

In this section, provide the correct answers for all questions. 
- For MCQs and VSA (1 mark): Provide the direct correct option or answer.
- For SA and LA (2, 3, 4, or 5 marks): Provide the solution **step-by-step**. The explanation or derivation must be proportional to the marks assigned. For higher marks, provide a detailed breakdown of steps or points.
- Ensure the language of the Answer Key matches the paper's language (Gujarati).

Output the complete paper as printable text, including the questions first, followed by the detailed Answer Key section at the bottom.`,
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
