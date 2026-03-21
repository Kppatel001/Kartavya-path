import { 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type AuthError
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile } from './firestore';
import type { UserRole } from '@/types';

export const signInWithEmail = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(error: any) {
      console.error("Error signing in with email: ", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-email') {
        throw new Error('ઈમેલ અથવા પાસવર્ડ ખોટો છે. કૃપા કરીને ફરી પ્રયાસ કરો.');
      }
      throw new Error(error.message || 'લોગિન દરમિયાન સમસ્યા આવી છે.');
    }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  name: string,
  role: UserRole,
  standard: string,
  school: string,
  district: string,
  taluka: string
): Promise<void> => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        await updateProfile(user, { displayName: name });
        
        await createUserProfile({
          uid: user.uid,
          name,
          email,
          role,
          standard,
          school,
          district,
          taluka
        });
      }
    } catch(error: any) {
      console.error("Error signing up with email: ", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('આ ઈમેલ પહેલેથી વપરાશમાં છે. કૃપા કરીને બીજા ઈમેલનો ઉપયોગ કરો અથવા લોગિન કરો.');
      } else if (authError.code === 'auth/weak-password') {
        throw new Error('પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('કૃપા કરીને સાચું ઈમેલ એડ્રેસ લખો.');
      }
      throw new Error(error.message || 'સાઇન-અપ દરમિયાન સમસ્યા આવી છે.');
    }
};

export const signOut = async () => {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out: ', error);
  }
};
