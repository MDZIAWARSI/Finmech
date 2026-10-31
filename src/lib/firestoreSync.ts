import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, UserProfile, CashDenominationCount } from '@/types/finance';
import { 
  saveTransactions, 
  saveProfile, 
  saveDenominations, 
  saveLiveBusinessBalance,
  getStoredTransactions,
  getStoredProfile,
  getStoredDenominations,
  getStoredLiveBusinessBalance 
} from './storage';

export function subscribeToUserData(
  userId: string,
  callbacks: {
    onTransactionsChange: (txs: Transaction[]) => void;
    onProfileChange: (profile: UserProfile) => void;
    onDenominationsChange: (denoms: CashDenominationCount) => void;
    onBusinessBalanceChange: (balance: number) => void;
  }
): () => void {
  if (!db || !userId) return () => {};

  // 1. Subscribe to User Profile document
  const userDocRef = doc(db, 'users', userId);
  const unsubUser = onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data.profile) {
        callbacks.onProfileChange(data.profile);
        saveProfile(data.profile);
      }
      if (data.denominations) {
        callbacks.onDenominationsChange(data.denominations);
        saveDenominations(data.denominations);
      }
      if (typeof data.businessBalance === 'number') {
        callbacks.onBusinessBalanceChange(data.businessBalance);
        saveLiveBusinessBalance(data.businessBalance);
      }
    } else {
      // First-time sync: Upload current local state to initialize cloud document
      const currentProfile = getStoredProfile();
      const currentDenoms = getStoredDenominations();
      const currentBizBalance = getStoredLiveBusinessBalance();
      setDoc(userDocRef, {
        profile: currentProfile,
        denominations: currentDenoms,
        businessBalance: currentBizBalance,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, { merge: true }).catch(console.warn);
    }
  }, (err) => console.warn('Firestore user doc snapshot error:', err));

  // 2. Subscribe to Transactions collection
  const txsColRef = collection(db, 'users', userId, 'transactions');
  const txsQuery = query(txsColRef, orderBy('createdAt', 'desc'));
  const unsubTxs = onSnapshot(txsQuery, (snap) => {
    if (!snap.empty) {
      const cloudTxs: Transaction[] = [];
      snap.forEach((d) => {
        cloudTxs.push(d.data() as Transaction);
      });
      callbacks.onTransactionsChange(cloudTxs);
      saveTransactions(cloudTxs);
    } else {
      // If cloud has 0 transactions, but user has existing local transactions, push them up
      const localTxs = getStoredTransactions();
      if (localTxs.length > 0) {
        const batch = writeBatch(db);
        localTxs.forEach((tx) => {
          const txDoc = doc(db, 'users', userId, 'transactions', tx.id);
          batch.set(txDoc, tx, { merge: true });
        });
        batch.commit().catch(console.warn);
      }
    }
  }, (err) => console.warn('Firestore transactions snapshot error:', err));

  return () => {
    unsubUser();
    unsubTxs();
  };
}

export async function addTransactionToCloud(userId: string, tx: Transaction) {
  if (!db || !userId) return;
  try {
    const txDoc = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txDoc, tx, { merge: true });
    await setDoc(doc(db, 'users', userId), { updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Failed to add transaction to Cloud Firestore:', err);
  }
}

export async function deleteTransactionFromCloud(userId: string, txId: string) {
  if (!db || !userId) return;
  try {
    const txDoc = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txDoc);
    await setDoc(doc(db, 'users', userId), { updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Failed to delete transaction from Cloud Firestore:', err);
  }
}

export async function updateProfileInCloud(userId: string, profile: UserProfile) {
  if (!db || !userId) return;
  try {
    await setDoc(doc(db, 'users', userId), {
      profile,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update profile in Cloud Firestore:', err);
  }
}

export async function updateDenominationsInCloud(userId: string, denominations: CashDenominationCount) {
  if (!db || !userId) return;
  try {
    await setDoc(doc(db, 'users', userId), {
      denominations,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update denominations in Cloud Firestore:', err);
  }
}

export async function updateBusinessBalanceInCloud(userId: string, businessBalance: number) {
  if (!db || !userId) return;
  try {
    await setDoc(doc(db, 'users', userId), {
      businessBalance,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update business balance in Cloud Firestore:', err);
  }
}

