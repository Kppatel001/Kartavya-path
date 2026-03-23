
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
  examType: z.string().optional().describe('Type of exam like Unit Test, Final Exam, etc.'),
});

export type GenerateBoardAlignedExamPaperInput = z.infer<typeof GenerateBoardAlignedExamPaperInputSchema>;

const GenerateBoardAlignedExamPaperOutputSchema = z.object({
  examPaper: z.string().describe('The generated exam paper in a printable format.'),
});

export type GenerateBoardAlignedExamPaperOutput = z.infer<typeof GenerateBoardAlignedExamPaperOutputSchema>;

// Server Action Wrapper with robust error handling
export async function generateBoardAlignedExamPaper(input: GenerateBoardAlignedExamPaperInput) {
  try {
    const result = await generateBoardAlignedExamPaperFlow(input);
    if (!result || !result.examPaper) {
      return { success: false, error: "AI પ્રશ્નપત્ર તૈયાર કરવામાં નિષ્ફળ રહ્યું. કૃપા કરીને ફરી પ્રયાસ કરો." };
    }
    return { success: true, examPaper: result.examPaper };
  } catch (error: any) {
    console.error("Genkit Flow Critical Error:", error);
    return { 
      success: false, 
      error: error.message || "સર્વર કનેક્શનમાં સમસ્યા છે. કૃપા કરીને ઇન્ટરનેટ ચેક કરો." 
    };
  }
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
Exam Type: {{{examType}}}

DIRECTIONS FOR GSEB STANDARDS:
- For Primary (Standard 1 to 5): Focus on simple, activity-based questions. Use 'વિભાગ A' for basic knowledge and 'વિભાગ B' for drawing/matching/short answers.
- For Upper Primary (Standard 6 to 8): Use Sections A, B, C. Section A should be 1-mark objective questions.
- For Secondary (Standard 9 & 10): STRICTLY follow the A, B, C, D pattern.
- For Higher Secondary (Standard 11 & 12):
  - Science: Physics/Chemistry/Biology should have Part A (MCQs) and Part B (Descriptive).
  - Commerce/Arts: Follow the A, B, C, D, E, F section pattern where Section E and F are for 4-5 marks questions.

{{#if blueprintText}}
STRUCTURE / BLUEPRINT DETAILS PROVIDED BY USER:
{{{blueprintText}}}
{{else}}
If no blueprint is provided, apply the standard GSEB/GCERT marking scheme for the specified subject and marks.
{{/if}}

The exam paper must follow a clean, structured format:

1. STRUCTURE (GSEB Pattern):
   - વિભાગ A (Section A): હેતુલક્ષી પ્રશ્નો (MCQs, True/False, Fill in the blanks) - 1 mark each.
   - વિભાગ B (Section B): ટૂંક જવાબી પ્રશ્નો (Short Answer) - 2 marks each.
   - વિભાગ C (Section C): સવિસ્તાર પ્રશ્નો (Descriptive) - 3 marks each.
   - વિભાગ D (Section D): લાંબા પ્રશ્નો (Long Answer / Essays) - 4 or 5 marks each.

2. FORMATTING RULES:
   - Use clear headers for each section, e.g., "--- વિભાગ A ---".
   - Number each question clearly (1, 2, 3...).
   - Ensure the marks distribution matches exactly {{{totalMarks}}}.
   - Use standard GCERT/GSEB terminology in Gujarati.

3. ANSWER KEY REQUIREMENT:
   At the very end of the paper, add "--- જવાબવહી / ઉત્તરવલી (Answer Key) ---".
   Provide solutions for all sections.

Output the content in શુદ્ધ Gujarati.`,
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
