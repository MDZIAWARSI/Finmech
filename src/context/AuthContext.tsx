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
    // Check initial local cached user session
    try {
      const saved = localStorage.getItem('finmech_local_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {}

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const storedUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email,
          };
          localStorage.setItem('finmech_local_user', JSON.stringify(storedUser));
          if (db) {
            await setDoc(doc(db, 'users', currentUser.uid), {
              name: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              profile: {
                name: currentUser.displayName,
                photoURL: currentUser.photoURL,
              },
              updatedAt: Date.now(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Could not sync auth profile to firestore:', e);
        }
      } else {
        try {
          const saved = localStorage.getItem('finmech_local_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        setUser(res.user);
        try {
          const storedUser = {
            uid: res.user.uid,
            displayName: res.user.displayName,
            photoURL: res.user.photoURL,
            email: res.user.email,
          };
          localStorage.setItem('finmech_local_user', JSON.stringify(storedUser));
          if (db) {
            await setDoc(doc(db, 'users', res.user.uid), {
              name: res.user.displayName,
              email: res.user.email,
              photoURL: res.user.photoURL,
              profile: {
                name: res.user.displayName,
                photoURL: res.user.photoURL,
              },
              updatedAt: Date.now(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Could not save google profile:', e);
        }
      }
    } else {
      // Offline/Local user fallback
      const localUser: any = {
        uid: 'local_user_' + Date.now(),
        displayName: 'User',
        email: 'user@example.com',
      };
      setUser(localUser);
      localStorage.setItem('finmech_local_user', JSON.stringify(localUser));
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      const localUser: any = {
        uid: 'local_user_' + Date.now(),
        displayName: email.split('@')[0],
        email: email,
      };
      setUser(localUser);
      localStorage.setItem('finmech_local_user', JSON.stringify(localUser));
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        if (name) {
          try {
            await updateProfile(cred.user, { displayName: name });
          } catch {}
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
      const localUser: any = {
        uid: 'local_user_' + Date.now(),
        displayName: name || email.split('@')[0],
        email: email,
      };
      setUser(localUser);
      localStorage.setItem('finmech_local_user', JSON.stringify(localUser));
    }
  };

  const signOutUser = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch {}
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

