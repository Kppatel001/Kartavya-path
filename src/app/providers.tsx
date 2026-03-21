'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { signOut, signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/firebase/auth';
import type { UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string, 
    pass: string, 
    name: string,
    role: UserRole,
    standard: string,
    school: string,
    district: string,
    taluka: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleSignInWithEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }
  
  const handleSignUpWithEmail = async (
    email: string, 
    password: string, 
    name: string,
    role: UserRole,
    standard: string,
    school: string,
    district: string,
    taluka: string
  ) => {
    await signUpWithEmail(email, password, name, role, standard, school, district, taluka);
  }

  const handleResetPassword = async (email: string) => {
    await resetPassword(email);
  }

  const value = {
    user,
    loading,
    signOut: handleSignOut,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    resetPassword: handleResetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
