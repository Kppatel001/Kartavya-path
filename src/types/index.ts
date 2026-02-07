import type { Timestamp } from 'firebase/firestore';

export type ExamPaperSettings = {
  state: string;
  board: string;
  classLevel: string;
  subject: string;
  chapters: string;
  totalMarks: number;
  language: string;
  schoolLogo?: string;
};

export type ExamPaper = {
  id: string;
  userId: string;
  title: string;
  settings: ExamPaperSettings;
  content: string;
  createdAt: Timestamp;
};
