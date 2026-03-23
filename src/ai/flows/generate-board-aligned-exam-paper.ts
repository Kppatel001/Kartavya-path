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

/**
 * Server Action to generate exam paper.
 * Ensures the heavy AI processing stays on the server.
 */
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
      error: error.message || "સર્વર કનેક્શનમાં સમસ્યા છે. કૃપા કરીને ઇન્ટરનેટ ચેક કરો અથવા API Key તપાસો." 
    };
  }
}

const generateBoardAlignedExamPaperPrompt = ai.definePrompt({
  name: 'generateBoardAlignedExamPaperPrompt',
  input: {schema: GenerateBoardAlignedExamPaperInputSchema},
  output: {schema: GenerateBoardAlignedExamPaperOutputSchema},
  prompt: `You are an expert in generating board-aligned exam papers for Gujarat Secondary and Higher Secondary Education Board (GSEB) and GCERT.

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
If the user has not provided a manual blueprint, apply these official GSEB/GCERT marking schemes:

1. PRIMARY (Std 1 to 5):
   - Focus: Activity-based, basic understanding.
   - Layout: 
     Section A: Objective (Fill blanks, Match, True/False) - 40% weight.
     Section B: Very Short Answer (1 line) - 30% weight.
     Section C: Simple drawing or practical application - 30% weight.

2. UPPER PRIMARY (Std 6 to 8):
   - Focus: Conceptual clarity.
   - Layout:
     વિભાગ A: 1-mark Objective (MCQs, VSA) - 20% weight.
     વિભાગ B: 2-marks Short Answer - 40% weight.
     વિભાગ C: 3-marks Long Answer - 40% weight.

3. SECONDARY (Std 9 & 10):
   - STRICTLY use the 80-mark Board Pattern scaled to {{{totalMarks}}}:
     વિભાગ A (Section A): હેતુલક્ષી પ્રશ્નો (MCQs, VSA, Fill in blanks, True/False) - 1 mark each (20% weight).
     વિભાગ B (Section B): ટૂંક જવાબી પ્રશ્નો (Answer in 2-3 sentences) - 2 marks each (25% weight).
     વિભાગ C (Section C): મુદ્દાસર ઉત્તર આપો (Answer in 5-6 sentences) - 3 marks each (30% weight).
     વિભાગ D (Section D): સવિસ્તાર ઉત્તર આપો (Detailed Answer/Problem Solving) - 4/5 marks each (25% weight).

4. HIGHER SECONDARY (Std 11 & 12):
   - Science Stream: Part A (MCQs) and Part B (Descriptive A, B, C, D). Scale to {{{totalMarks}}}.
   - Commerce/Arts: Standard board sections A through F.

{{#if blueprintText}}
USER PROVIDED CUSTOM BLUEPRINT / STRUCTURE:
{{{blueprintText}}}
Apply this structure strictly.
{{else}}
NO BLUEPRINT PROVIDED. Apply the standard GSEB/GCERT marking scheme for Std {{{classLevel}}} and Subject {{{subject}}}.
{{/if}}

FORMATTING RULES:
- Use standard Gujarati terminology: "પ્રશ્નપત્ર", "વિષય", "ધોરણ", "કુલ ગુણ", "સમય".
- Section headers must be bold: "--- વિભાગ A ---".
- Total marks must sum exactly to {{{totalMarks}}}.
- Include answer key at the end with "--- જવાબવહી (Answer Key) ---".

Output the content in professional Gujarati.`,
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
