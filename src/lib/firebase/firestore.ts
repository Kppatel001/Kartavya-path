import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { ExamPaper, ExamPaperSettings } from '@/types';

const papersCollection = 'papers';

export async function addPaper(userId: string, title: string, settings: ExamPaperSettings, content: string): Promise<string | null> {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, papersCollection), {
      userId,
      title,
      settings,
      content,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}

export async function getPapersForUser(userId: string): Promise<ExamPaper[]> {
  if (!db) return [];
  const q = query(collection(db, papersCollection), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const papers: ExamPaper[] = [];
  querySnapshot.forEach((doc) => {
    papers.push({ id: doc.id, ...doc.data() } as ExamPaper);
  });
  return papers;
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
