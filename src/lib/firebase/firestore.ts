import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { ExamPaper, ExamPaperSettings, StudentMastery, FocusSession, UserProfile } from '@/types';

const usersCollection = 'users';
const papersCollection = 'papers';
const focusSessionsCollection = 'focus_sessions';
const masteryCollection = 'mastery';

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, usersCollection, profile.uid);
  try {
    await setDoc(docRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const docRef = doc(db, usersCollection, uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function addPaper(userId: string, title: string, settings: ExamPaperSettings, content: string): Promise<string> {
  if (!db) {
    throw new Error("Firestore database is not initialized.");
  }
  try {
    const docRef = await addDoc(collection(db, papersCollection), {
      userId,
      title,
      settings,
      content,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e: any) {
    console.error("Error adding document to Firestore: ", e);
    throw new Error("Failed to save paper: " + e.message);
  }
}

export async function getPapersForUser(userId: string): Promise<ExamPaper[]> {
  if (!db) return [];
  const q = query(collection(db, papersCollection), where("userId", "==", userId));
  try {
    const querySnapshot = await getDocs(q);
    const papers: ExamPaper[] = [];
    querySnapshot.forEach((doc) => {
      papers.push({ id: doc.id, ...doc.data() } as ExamPaper);
    });
    return papers.sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching papers: ", error);
    return [];
  }
}

export async function getPaper(paperId: string): Promise<ExamPaper | null> {
  if (!db) return null;
  const docRef = doc(db, papersCollection, paperId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ExamPaper;
    }
    return null;
  } catch (error) {
    console.error("Error getting paper:", error);
    return null;
  }
}

export async function updatePaperContent(paperId: string, content: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, papersCollection, paperId);
  try {
    await updateDoc(docRef, { content });
  } catch (error) {
    console.error("Error updating paper:", error);
    throw error;
  }
}

export async function deletePaper(paperId: string): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  const docRef = doc(db, papersCollection, paperId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting paper:", error);
    throw error;
  }
}

export async function addFocusSession(userId: string, durationMinutes: number): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, focusSessionsCollection), {
      userId,
      durationMinutes,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding focus session:", error);
    throw error;
  }
}

export async function getMasteryForUser(userId: string): Promise<StudentMastery[]> {
  if (!db) return [];
  const q = query(collection(db, masteryCollection), where("userId", "==", userId));
  try {
    const querySnapshot = await getDocs(q);
    const mastery: StudentMastery[] = [];
    querySnapshot.forEach((doc) => {
      mastery.push({ id: doc.id, ...doc.data() } as StudentMastery);
    });
    return mastery;
  } catch (error) {
    console.error("Error fetching mastery: ", error);
    return [];
  }
}

export async function getFocusSessionsForUser(userId: string): Promise<FocusSession[]> {
  if (!db) return [];
  const q = query(collection(db, focusSessionsCollection), where("userId", "==", userId));
  try {
    const querySnapshot = await getDocs(q);
    const sessions: FocusSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as FocusSession);
    });
    return sessions;
  } catch (error) {
    console.error("Error fetching sessions: ", error);
    return [];
  }
}
