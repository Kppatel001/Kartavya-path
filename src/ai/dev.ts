
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-board-aligned-exam-paper.ts';
import '@/ai/flows/translate-exam-papers.ts';
import '@/ai/flows/regenerate-individual-questions.ts';
import '@/ai/flows/extract-blueprint.ts';
import '@/ai/flows/socratic-tutor-flow.ts';
import '@/ai/flows/gujarati-tts-flow.ts';
