import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { ExamPaper, ExamPaperSettings } from '@/types';

const papersCollection = 'papers';

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
    if (e.code === 'permission-denied') {
        throw new Error("Permission denied. You do not have access to save data. Please check your Firestore security rules.");
    }
    throw new Error("Failed to save paper to the database. " + e.message);
  }
}

export async function getPapersForUser(userId: string): Promise<ExamPaper[]> {
  if (!db) return [];
  
  // કમ્પોઝિટ ઇન્ડેક્સની ભૂલ ટાળવા માટે અહીંથી orderBy હટાવ્યું છે.
  // આપણે નીચે જાવાસ્ક્રિપ્ટ દ્વારા સોર્ટિંગ કરીશું.
  const q = query(collection(db, papersCollection), where("userId", "==", userId));
  
  try {
    const querySnapshot = await getDocs(q);
    const papers: ExamPaper[] = [];
    querySnapshot.forEach((doc) => {
      papers.push({ id: doc.id, ...doc.data() } as ExamPaper);
    });
    
    // ઇન-મેમરી સોર્ટિંગ: નવા પેપર પહેલા આવશે
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
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ExamPaper;
  } else {
    console.log("No such document!");
    return null;
  }
}

export async function updatePaperContent(paperId: string, content: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, papersCollection, paperId);
  await updateDoc(docRef, { content });
}
