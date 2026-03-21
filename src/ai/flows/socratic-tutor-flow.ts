'use server';
/**
 * @fileOverview Socratic Tutor flow for GSEB students.
 * Guides students through thinking process instead of giving direct answers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SocraticTutorInputSchema = z.object({
  subject: z.string(),
  classLevel: z.string(),
  question: z.string(),
  studentQuery: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional(),
});

export type SocraticTutorInput = z.infer<typeof SocraticTutorInputSchema>;

const SocraticTutorOutputSchema = z.object({
  response: z.string().describe('The Socratic response in Gujarati.'),
  suggestedNextStep: z.string().optional().describe('A hint or a leading question.'),
});

export type SocraticTutorOutput = z.infer<typeof SocraticTutorOutputSchema>;

export async function socraticTutor(input: SocraticTutorInput): Promise<SocraticTutorOutput> {
  return socraticTutorFlow(input);
}

const tutorPrompt = ai.definePrompt({
  name: 'socraticTutorPrompt',
  input: {schema: SocraticTutorInputSchema},
  output: {schema: SocraticTutorOutputSchema},
  prompt: `તમે ગુજરાત બોર્ડ (GSEB) ના વિદ્યાર્થીઓ માટે એક નિષ્ણાત 'સોક્રેટિક ટ્યુટર' છો.
તમારું નામ 'વિદ્યા' છે.

વિષય: {{{subject}}}
ધોરણ: {{{classLevel}}}
પ્રશ્ન જેના પર કામ કરી રહ્યા છીએ: {{{question}}}
વિદ્યાર્થીનો પ્રશ્ન/મૂંઝવણ: {{{studentQuery}}}

તમારો ધ્યેય:
1. સીધો જવાબ ક્યારેય ન આપવો.
2. વિદ્યાર્થીને વિચારવા મજબૂર કરે તેવા પ્રશ્નો પૂછો.
3. કન્સેપ્ટ સમજાવવા માટે સ્થાનિક (ગુજરાતી) ઉદાહરણોનો ઉપયોગ કરો.
4. બધું જ લખાણ શુદ્ધ ગુજરાતીમાં હોવું જોઈએ.
5. જો વિદ્યાર્થી ખોટું વિચારે, તો તેને નરમાશથી સાચી દિશામાં વાળો.

જવાબ આપતી વખતે પ્રોત્સાહન આપો.`,
});

const socraticTutorFlow = ai.defineFlow(
  {
    name: 'socraticTutorFlow',
    inputSchema: SocraticTutorInputSchema,
    outputSchema: SocraticTutorOutputSchema,
  },
  async input => {
    const {output} = await tutorPrompt(input);
    return output!;
  }
);
