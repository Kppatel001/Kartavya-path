'use client';
// Defensive configuration loading
const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY', "AIzaSyBdBrER_yooVysal32Ix-C37zaoowfVh4g"),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', "studio-5207264830-5a628.firebaseapp.com"),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', "studio-5207264830-5a628"),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', "studio-5207264830-5a628.appspot.com"),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', "478287114544"),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID', "1:478287114544:web:ec91f0586db560df94d8f5")
};
