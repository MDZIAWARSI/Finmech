import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function getFirebaseConfig() {
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId && envConfig.apiKey !== 'dummy') {
    return envConfig;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('finmech_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {}
  }

  return envConfig;
}

const firebaseConfig = getFirebaseConfig();

// Check if Firebase is configured with real credentials
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'dummy'
);

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });
    } catch (err) {
      console.warn('Failed to initialize Firebase with provided config:', err);
    }
  }
}

export { app, auth, db, googleProvider };

