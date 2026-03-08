import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type AuthError
} from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase is not configured.");
  }
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google: ', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(error) {
      console.error("Error signing in with email: ", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw error;
    }
};

export const signUpWithEmail = async (email: string, password: string, name?: string): Promise<void> => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch(error) {
      console.error("Error up with email: ", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please sign in or use a different email.');
      }
      throw error;
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
