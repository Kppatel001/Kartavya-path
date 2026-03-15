
import type { Timestamp } from 'firebase/firestore';

export type ExamPaperSettings = {
  state: string;
  district: string;
  taluka?: string;
  board: string;
  classLevel: string;
  subject: string;
  chapters: string;
  totalMarks: number;
  language: string;
  schoolName?: string;
  timeAllowed?: string;
  schoolLogo?: string;
  blueprintText?: string;
};

export type ExamPaper = {
  id: string;
  userId: string;
  title: string;
  settings: ExamPaperSettings;
  content: string;
  createdAt: Timestamp;
};

export type StudentMastery = {
  id: string;
  userId: string;
  subject: string;
  progress: number;
  lastUpdated: Timestamp;
};

export type FocusSession = {
  id: string;
  userId: string;
  durationMinutes: number;
  completedAt: Timestamp;
};
