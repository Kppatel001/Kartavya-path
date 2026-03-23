
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'teacher' | 'student';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  standard: string;
  school: string;
  district: string;
  taluka: string;
  createdAt: Timestamp;
};

export type BlueprintSection = {
  id: string;
  name: string;
  questionType: 'MCQ' | 'VSA' | 'SA' | 'LA';
  numQuestions: number;
  marksPerQuestion: number;
  difficulty: 'સામાન્ય' | 'મધ્યમ' | 'અઘરું';
};

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
  examType?: string;
  structuredBlueprint?: BlueprintSection[];
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
