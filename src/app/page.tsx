'use client';

import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  UserProfile, 
  CashDenominationCount, 
  TransactionType, 
  PocketType 
} from '@/types/finance';
import { 
  getStoredTransactions, 
  saveTransactions, 
  getStoredProfile, 
  saveProfile, 
  getStoredDenominations, 
  saveDenominations, 
  getStoredLiveBusinessBalance,
  saveLiveBusinessBalance,
  clearUserData,
  exportFinancialDataJson,
  DEFAULT_PROFILE,
  DEFAULT_DENOMINATIONS
} from '@/lib/storage';
import { 
  computeFinancialSummary, 
  calculateDenominationTotal 
} from '@/lib/financeCalculations';
import { Navbar, NavTab } from '@/components/Navbar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { CashTrackerView } from '@/components/CashTrackerView';
import { BusinessTrackerView } from '@/components/BusinessTrackerView';
import { ExpenditureView } from '@/components/ExpenditureView';
import { AiCopilotView } from '@/components/AiCopilotView';
import { QuickEntryModal } from '@/components/QuickEntryModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { SavingsTargetModal } from '@/components/SavingsTargetModal';
import { AuthModal } from '@/components/AuthModal';
import { SignInGate } from '@/components/SignInGate';
import { useAuth } from '@/context/AuthContext';
import { 
  subscribeToUserData, 
  addTransactionToCloud, 
  deleteTransactionFromCloud, 
  updateProfileInCloud, 
  updateDenominationsInCloud, 
  updateBusinessBalanceInCloud,
  clearUserCloudData
} from '@/lib/firestoreSync';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [denominations, setDenominations] = useState<CashDenominationCount>(DEFAULT_DENOMINATIONS);
  const [manualBusinessBalance, setManualBusinessBalance] = useState<number | undefined>(undefined);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const { user, loading: authLoading, signOutUser } = useAuth();

  // Modals state
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryDefaults, setQuickEntryDefaults] = useState<{
    type?: TransactionType;
    pocket?: PocketType;
    toPocket?: PocketType;
    category?: string;
  }>({});
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenQuickEntry = (params?: {
    type?: TransactionType;
    pocket?: PocketType;
    toPocket?: PocketType;
    category?: string;
  }) => {
    setQuickEntryDefaults(params || {});
    setIsQuickEntryOpen(true);
  };

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  // Isolate and load data keyed to the authenticated user
  useEffect(() => {
    if (!mounted) return;
    if (user?.uid) {
      const uid = user.uid;
      setTransactions(getStoredTransactions(uid));
      setProfile(getStoredProfile(uid));
      setDenominations(getStoredDenominations(uid));
      setManualBusinessBalance(getStoredLiveBusinessBalance(uid));
    } else if (isGuestMode) {
      setTransactions(getStoredTransactions(null));
      setProfile(getStoredProfile(null));
      setDenominations(getStoredDenominations(null));
      setManualBusinessBalance(getStoredLiveBusinessBalance(null));
    } else {
      // User signed out -> Wipe memory completely so no data is taken or exposed
      setTransactions([]);
      setProfile(DEFAULT_PROFILE);
      setDenominations(DEFAULT_DENOMINATIONS);
      setManualBusinessBalance(0);
    }
  }, [user?.uid, isGuestMode, mounted]);

  // Real-time Cloud Firestore synchronization when user is signed in
  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;
    const unsubscribe = subscribeToUserData(uid, {
      onTransactionsChange: (txs) => setTransactions(txs),
      onProfileChange: (p) => {
        setProfile((prev) => {
          const merged = {
            ...p,
            name: p.name || user.displayName || prev.name,
            photoURL: p.photoURL || user.photoURL || prev.photoURL,
          };
          saveProfile(merged, uid);
          return merged;
        });
      },
      onDenominationsChange: (d) => setDenominations(d),
      onBusinessBalanceChange: (b) => setManualBusinessBalance(b),
    });
    return () => unsubscribe();
  }, [user?.uid, user?.displayName, user?.photoURL]);

  // Keep profile in sync with Google account display name & photo
  useEffect(() => {
    if (!user) return;
    const photo = user.photoURL || user.providerData?.find((p) => p.photoURL)?.photoURL || null;
    const name = user.displayName || user.providerData?.find((p) => p.displayName)?.displayName || null;
    if (name || photo) {
      setProfile((prev) => {
        const updated = {
          ...prev,
          name: name || prev.name,
          photoURL: photo || prev.photoURL,
        };
        saveProfile(updated, user.uid);
        return updated;
      });
    }
  }, [user?.displayName, user?.photoURL]);

  // Compute live financial summary
  const summary = computeFinancialSummary(
    transactions,
    profile.monthlySavingsTarget,
    calculateDenominationTotal(denominations),
    manualBusinessBalance,
    currentDate
  );

  // Keep live business balance in sync with ledger calculations
  useEffect(() => {
    if (mounted && user?.uid && typeof summary.businessBalance === 'number') {
      saveLiveBusinessBalance(summary.businessBalance, user.uid);
      updateBusinessBalanceInCloud(user.uid, summary.businessBalance);
    }
  }, [summary.businessBalance, mounted, user?.uid]);

  // When user has zero transactions, ensure balances and counters start at absolute zero
  useEffect(() => {
    if (mounted && transactions.length === 0) {
      if (calculateDenominationTotal(denominations) > 0) {
        setDenominations(DEFAULT_DENOMINATIONS);
        saveDenominations(DEFAULT_DENOMINATIONS, user?.uid);
        if (user?.uid) updateDenominationsInCloud(user.uid, DEFAULT_DENOMINATIONS);
      }
      if (manualBusinessBalance && manualBusinessBalance > 0) {
        setManualBusinessBalance(0);
        saveLiveBusinessBalance(0, user?.uid);
        if (user?.uid) updateBusinessBalanceInCloud(user.uid, 0);
      }
    }
  }, [transactions.length, mounted]);

  // Actions
  const handleAddTransaction = (entry: {
    type: TransactionType;
    pocket: PocketType;
    toPocket?: PocketType;
    category: string;
    amount: number;
    note: string;
  }) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: entry.type,
      pocket: entry.pocket,
      toPocket: entry.toPocket,
      category: entry.category,
      amount: entry.amount,
      date: new Date().toISOString(),
      note: entry.note,
      createdAt: Date.now(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated, user?.uid);
    if (user?.uid) {
      addTransactionToCloud(user.uid, newTx);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const deletedTx = transactions.find((t) => t.id === id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated, user?.uid);
    if (user?.uid) {
      deleteTransactionFromCloud(user.uid, id);
    }

    // If deleting an ATM withdrawal, deduct the added ₹500 notes from wallet counter
    if (deletedTx && deletedTx.type === 'transfer' && deletedTx.toPocket === 'cash') {
      const notesToRemove = Math.floor(deletedTx.amount / 500);
      if (notesToRemove > 0) {
        const updatedDenoms = {
          ...denominations,
          500: Math.max(0, (denominations[500] || 0) - notesToRemove),
        };
        setDenominations(updatedDenoms);
        saveDenominations(updatedDenoms, user?.uid);
        if (user?.uid) {
          updateDenominationsInCloud(user.uid, updatedDenoms);
        }
      }
    }

    // If all transactions have been deleted, reset all pockets, physical denominations, and business counts to absolute zero
    if (updated.length === 0) {
      setDenominations(DEFAULT_DENOMINATIONS);
      saveDenominations(DEFAULT_DENOMINATIONS, user?.uid);
      setManualBusinessBalance(0);
      saveLiveBusinessBalance(0, user?.uid);
      if (user?.uid) {
        updateDenominationsInCloud(user.uid, DEFAULT_DENOMINATIONS);
        updateBusinessBalanceInCloud(user.uid, 0);
      }
    }
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    saveTransactions(updated, user?.uid);
    if (user?.uid) {
      addTransactionToCloud(user.uid, updatedTx);
    }
    setEditingTransaction(null);
  };

  const handleUpdateDenominations = (newCounts: CashDenominationCount) => {
    setDenominations(newCounts);
    saveDenominations(newCounts, user?.uid);
    if (user?.uid) {
      updateDenominationsInCloud(user.uid, newCounts);
    }

    // Check variance between newly audited physical total and current ledger cash balance
    const physicalTotal = calculateDenominationTotal(newCounts);
    const variance = physicalTotal - summary.cashInHand;
    if (variance !== 0) {
      const adjustmentTx: Transaction = {
        id: `tx_adj_${Date.now()}`,
        type: variance > 0 ? 'income' : 'expense',
        pocket: 'cash',
        category: 'Cash Audit Reconciliation',
        amount: Math.abs(variance),
        date: new Date().toISOString(),
        note: variance > 0 ? 'Wallet cash count update' : 'Cash count adjustment',
        createdAt: Date.now(),
      };
      const updated = [adjustmentTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated, user?.uid);
      if (user?.uid) {
        addTransactionToCloud(user.uid, adjustmentTx);
      }
    }
  };

  const handleAtmWithdrawal = (amount: number) => {
    const atmTx: Transaction = {
      id: `tx_atm_${Date.now()}`,
      type: 'transfer',
      pocket: 'bank',
      toPocket: 'cash',
      category: 'ATM Cash Withdrawal',
      amount,
      date: new Date().toISOString(),
      note: 'ATM cash replenishment',
      createdAt: Date.now(),
    };
    const updated = [atmTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated, user?.uid);
    if (user?.uid) {
      addTransactionToCloud(user.uid, atmTx);
    }

    // Automatically update physical denomination note count (in ₹500 notes) so physical wallet stays in sync
    const notesToAdd = Math.floor(amount / 500);
    if (notesToAdd > 0) {
      const updatedDenoms = {
        ...denominations,
        500: (denominations[500] || 0) + notesToAdd,
      };
      setDenominations(updatedDenoms);
      saveDenominations(updatedDenoms, user?.uid);
      if (user?.uid) {
        updateDenominationsInCloud(user.uid, updatedDenoms);
      }
    }
  };

  const handleUpdateBusinessBalance = (newBalance: number) => {
    const variance = newBalance - summary.businessBalance;
    if (variance !== 0) {
      const adjTx: Transaction = {
        id: `tx_biz_adj_${Date.now()}`,
        type: variance > 0 ? 'income' : 'expense',
        pocket: 'business',
        category: 'Business Capital Adjustment',
        amount: Math.abs(variance),
        date: new Date().toISOString(),
        note: variance > 0 ? 'Business starting capital / deposit' : 'Business cash drawer count reconciliation',
        createdAt: Date.now(),
      };
      const updated = [adjTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated, user?.uid);
      if (user?.uid) {
        addTransactionToCloud(user.uid, adjTx);
      }
    }
    setManualBusinessBalance(newBalance);
    saveLiveBusinessBalance(newBalance, user?.uid);
    if (user?.uid) {
      updateBusinessBalanceInCloud(user.uid, newBalance);
    }
  };

  const handleTransferBusinessToPersonal = (amount: number) => {
    const transferTx: Transaction = {
      id: `tx_draw_${Date.now()}`,
      type: 'transfer',
      pocket: 'business',
      toPocket: 'bank',
      category: 'Owner Draw',
      amount,
      date: new Date().toISOString(),
      note: 'Transfer from live business to personal bank',
      createdAt: Date.now(),
    };
    const updated = [transferTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated, user?.uid);
    if (user?.uid) {
      addTransactionToCloud(user.uid, transferTx);
    }
  };

  const handleSaveTarget = (newTarget: number) => {
    const updatedProfile = {
      ...profile,
      monthlySavingsTarget: newTarget,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile, user?.uid);
    if (user?.uid) {
      updateProfileInCloud(user.uid, updatedProfile);
    }
  };

  // Full clean reset of data (Local & Cloud)
  const handleClearAllData = async () => {
    if (user?.uid) {
      await clearUserCloudData(user.uid);
      clearUserData(user.uid);
    } else {
      clearUserData(null);
    }
    setTransactions([]);
    setDenominations(DEFAULT_DENOMINATIONS);
    setManualBusinessBalance(0);
    const resetProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: user?.uid || 'user_default',
      name: user?.displayName || '',
      photoURL: user?.photoURL || undefined,
    };
    setProfile(resetProfile);
    saveProfile(resetProfile, user?.uid);
  };

  // Clear device cache and re-sync
  const handleClearLocalCache = () => {
    clearUserData(user?.uid);
    setTransactions([]);
    setDenominations(DEFAULT_DENOMINATIONS);
    setManualBusinessBalance(0);
  };

  const handleExportData = () => {
    const jsonStr = exportFinancialDataJson(
      transactions, 
      profile, 
      denominations, 
      summary.businessBalance
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finmech_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Only render on client to ensure hydrations match localStorage
  if (!mounted || (authLoading && !user)) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white animate-spin" />
      </div>
    );
  }

  // Mandatory Sign-In Screen when unauthenticated
  if (!user && !isGuestMode) {
    return <SignInGate onContinueAsGuest={() => setIsGuestMode(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Navbar Header & Floating Nav */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenQuickEntry={() => handleOpenQuickEntry()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userName={user?.displayName || user?.providerData?.find((p) => p.displayName)?.displayName || profile.name || (user?.email ? user.email.split('@')[0] : undefined)}
        userPhoto={user?.photoURL || user?.providerData?.find((p) => p.photoURL)?.photoURL || profile.photoURL || null}
        userEmail={user ? (user.email || user.providerData?.find((p) => p.email)?.email || null) : null}
      />

      {/* Main Container - Mobile First with Desktop Max Width */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            recentTransactions={transactions}
            currency={profile.currency}
            onNavigateTab={setCurrentTab}
            onOpenQuickEntry={() => handleOpenQuickEntry()}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={setEditingTransaction}
          />
        )}

        {currentTab === 'spends' && (
          <ExpenditureView
            summary={summary}
            transactions={transactions.filter((t) => t.pocket !== 'business' && t.toPocket !== 'business')}
            currency={profile.currency}
            onOpenQuickEntry={() => handleOpenQuickEntry({ type: 'expense', pocket: 'bank' })}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={setEditingTransaction}
            onExportData={handleExportData}
          />
        )}

        {currentTab === 'cash' && (
          <CashTrackerView
            cashInHand={summary.cashInHand}
            denominations={denominations}
            currency={profile.currency}
            onUpdateDenominations={handleUpdateDenominations}
            onAtmWithdrawal={handleAtmWithdrawal}
            onOpenQuickEntry={() => handleOpenQuickEntry({ pocket: 'cash' })}
          />
        )}

        {currentTab === 'business' && (
          <BusinessTrackerView
            summary={summary}
            businessTransactions={transactions.filter((t) => t.pocket === 'business' || t.toPocket === 'business')}
            currency={profile.currency}
            onUpdateBusinessBalance={handleUpdateBusinessBalance}
            onOpenQuickEntry={handleOpenQuickEntry}
            onTransferToPersonal={handleTransferBusinessToPersonal}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={setEditingTransaction}
          />
        )}

        {currentTab === 'copilot' && (
          <AiCopilotView
            summary={summary}
            currency={profile.currency}
            userName={user?.displayName || user?.providerData?.find((p) => p.displayName)?.displayName || profile.name || (user?.email ? user.email.split('@')[0] : undefined)}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Quick Entry Keypad Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={profile.currency}
        initialType={quickEntryDefaults.type}
        initialPocket={quickEntryDefaults.pocket}
        initialToPocket={quickEntryDefaults.toPocket}
        initialCategory={quickEntryDefaults.category}
      />

      {/* Edit / Redo / Reassign Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        currency={profile.currency}
      />

      {/* Savings Target Adjustment Modal */}
      <SavingsTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        currentTarget={profile.monthlySavingsTarget}
        currentSaved={summary.savingsGoal.currentSaved}
        currency={profile.currency}
        onSaveTarget={handleSaveTarget}
      />

      {/* Cloud Account & Database Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onClearAllData={handleClearAllData}
        onClearLocalCache={handleClearLocalCache}
        onExportData={handleExportData}
      />
    </div>
  );
}
