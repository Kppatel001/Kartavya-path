'use server';
/**
 * @fileOverview A flow to extract exam blueprint details from uploaded documents.
 *
 * - extractBlueprint - A function that extracts structured blueprint data from an image or document.
 * - ExtractBlueprintInput - The input type for the extractBlueprint function.
 * - ExtractBlueprintOutput - The return type for the extractBlueprint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractBlueprintInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The document or image containing the blueprint, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ExtractBlueprintInput = z.infer<typeof ExtractBlueprintInputSchema>;

const ExtractBlueprintOutputSchema = z.object({
  extractedBlueprint: z.string().describe('The extracted blueprint details as a structured text description.'),
});

export type ExtractBlueprintOutput = z.infer<typeof ExtractBlueprintOutputSchema>;

export async function extractBlueprint(input: ExtractBlueprintInput): Promise<ExtractBlueprintOutput> {
  return extractBlueprintFlow(input);
}

const extractBlueprintPrompt = ai.definePrompt({
  name: 'extractBlueprintPrompt',
  input: {schema: ExtractBlueprintInputSchema},
  output: {schema: ExtractBlueprintOutputSchema},
  prompt: `You are an expert at analyzing educational documents and blueprints.
  
Extract the exam structure and marking scheme from the provided document. 
Identify sections (Section A, B, C, D), types of questions (MCQ, VSA, SA, LA), number of questions per section, and marks per question.

Document: {{media url=fileDataUri}}

Output the blueprint in a clear, structured text format that can be used to generate an exam paper.`,
});

const extractBlueprintFlow = ai.defineFlow(
  {
    name: 'extractBlueprintFlow',
    inputSchema: ExtractBlueprintInputSchema,
    outputSchema: ExtractBlueprintOutputSchema,
  },
  async input => {
    const {output} = await extractBlueprintPrompt(input);
    return output!;
  }
);
