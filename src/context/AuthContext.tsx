'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  signInWithGoogle: async () => { },
  signInWithEmail: async () => { },
  signUpWithEmail: async () => { },
  signOutUser: async () => { },
  syncWithCloud: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial local cached user session (purge any legacy dummy "local_user_" or "user@example.com")
    try {
      const saved = localStorage.getItem('finmech_local_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid && !parsed.uid.startsWith('local_user_') && parsed.email !== 'user@example.com') {
          setUser(parsed);
        } else {
          localStorage.removeItem('finmech_local_user');
        }
      }
    } catch { }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Fallback safety timeout to guarantee loading never hangs
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(safetyTimer);
      if (currentUser) {
        const photo = currentUser.photoURL || currentUser.providerData?.find((p) => p.photoURL)?.photoURL || null;
        const name = currentUser.displayName || currentUser.providerData?.find((p) => p.displayName)?.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
        const email = currentUser.email || currentUser.providerData?.find((p) => p.email)?.email || null;

        const storedUser = {
          uid: currentUser.uid,
          displayName: name,
          photoURL: photo,
          email: email,
        };
        setUser(currentUser);
        try {
          localStorage.setItem('finmech_local_user', JSON.stringify(storedUser));
        } catch { }

        // Non-blocking background sync adhering to firestore.rules
        if (db) {
          setDoc(doc(db, 'users', currentUser.uid), {
            name: name,
            email: email,
            lastSynced: Date.now(),
          }, { merge: true }).catch((e) => {
            console.warn('Could not sync auth profile to firestore:', e);
          });
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('finmech_local_user');
        } catch {}
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const photo = res.user.photoURL || res.user.providerData?.find((p) => p.photoURL)?.photoURL || null;
        const name = res.user.displayName || res.user.providerData?.find((p) => p.displayName)?.displayName || (res.user.email ? res.user.email.split('@')[0] : 'User');
        const email = res.user.email || res.user.providerData?.find((p) => p.email)?.email || null;

        const storedUser = {
          uid: res.user.uid,
          displayName: name,
          photoURL: photo,
          email: email,
        };
        setUser(res.user);
        setLoading(false);
        try {
          localStorage.setItem('finmech_local_user', JSON.stringify(storedUser));
        } catch { }

        // Non-blocking background sync
        if (db) {
          setDoc(doc(db, 'users', res.user.uid), {
            name: name,
            email: email,
            lastSynced: Date.now(),
          }, { merge: true }).catch((e) => {
            console.warn('Could not save google profile:', e);
          });
        }
      }
    } else {
      throw new Error('Firebase Authentication is not initialized.');
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      throw new Error('Firebase Authentication is not initialized.');
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        if (name) {
          try {
            await updateProfile(cred.user, { displayName: name });
          } catch { }
        }
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), {
            name: name || cred.user.displayName,
            email,
            profile: {
              name: name || cred.user.displayName,
            },
            createdAt: Date.now(),
          }, { merge: true });
        }
      }
    } else {
      throw new Error('Firebase Authentication is not initialized.');
    }
  };

  const signOutUser = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch { }
    }
    setUser(null);
    localStorage.removeItem('finmech_local_user');
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

