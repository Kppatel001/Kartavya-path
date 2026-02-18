'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { signInWithGoogle, signOut, signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleSignInWithEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }
  
  const handleSignUpWithEmail = async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  }

  const value = {
    user,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
