'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { Transaction, UserProfile, CashDenominationCount } from '@/types/finance';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  syncWithCloud: (data: {
    transactions: Transaction[];
    profile: UserProfile;
    denominations: CashDenominationCount;
    businessBalance: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOutUser: async () => {},
  syncWithCloud: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase credentials are not configured yet.');
    }
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (db && cred.user) {
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        createdAt: Date.now(),
      }, { merge: true });
    }
  };

  const signOutUser = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const syncWithCloud = async (data: {
    transactions: Transaction[];
    profile: UserProfile;
    denominations: CashDenominationCount;
    businessBalance: number;
  }) => {
    if (!db || !user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        profile: data.profile,
        denominations: data.denominations,
        businessBalance: data.businessBalance,
        lastSynced: Date.now(),
      }, { merge: true });

      // Save transactions in subcollection batch
      const batch = writeBatch(db);
      data.transactions.slice(0, 100).forEach((tx) => {
        const txDoc = doc(db, 'users', user.uid, 'transactions', tx.id);
        batch.set(txDoc, tx, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Failed to sync to Firestore cloud DB:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        syncWithCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

