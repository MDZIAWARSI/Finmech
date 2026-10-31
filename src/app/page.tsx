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
import { SavingsTargetModal } from '@/components/SavingsTargetModal';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [denominations, setDenominations] = useState<CashDenominationCount>(DEFAULT_DENOMINATIONS);
  const [manualBusinessBalance, setManualBusinessBalance] = useState<number | undefined>(undefined);
  const { user, syncWithCloud } = useAuth();

  // Modals state
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
    setTransactions(getStoredTransactions());
    setProfile(getStoredProfile());
    setDenominations(getStoredDenominations());
  }, []);

  // Compute live financial summary
  const summary = computeFinancialSummary(
    transactions,
    profile.monthlySavingsTarget,
    undefined,
    manualBusinessBalance,
    currentDate
  );

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
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleUpdateDenominations = (newCounts: CashDenominationCount) => {
    setDenominations(newCounts);
    saveDenominations(newCounts);

    // Calculate physical cash total and create an adjustment transaction if there is variance
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
        note: `Denomination count audit adjustment`,
        createdAt: Date.now(),
      };
      const updated = [adjustmentTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
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
    saveTransactions(updated);
  };

  const handleUpdateBusinessBalance = (newBalance: number) => {
    setManualBusinessBalance(newBalance);
    // Also record a business capital adjustment transaction for ledger alignment
    const variance = newBalance - summary.businessBalance;
    if (variance !== 0) {
      const adjTx: Transaction = {
        id: `tx_biz_adj_${Date.now()}`,
        type: variance > 0 ? 'income' : 'expense',
        pocket: 'business',
        category: 'Business Capital Adjustment',
        amount: Math.abs(variance),
        date: new Date().toISOString(),
        note: 'Live business count manual update',
        createdAt: Date.now(),
      };
      const updated = [adjTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
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
    saveTransactions(updated);
  };

  const handleSaveTarget = (newTarget: number) => {
    const updatedProfile = {
      ...profile,
      monthlySavingsTarget: newTarget,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const handleExportData = () => {
    const jsonStr = exportFinancialDataJson(transactions, profile);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finmech_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Only render on client to ensure hydrations match localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Navbar Header & Floating Nav */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userName={user?.displayName || user?.email?.split('@')[0] || profile.name}
        userPhoto={user?.photoURL}
        userEmail={user?.email}
      />

      {/* Main Container - Mobile First with Desktop Max Width */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            recentTransactions={transactions}
            currency={profile.currency}
            onNavigateTab={setCurrentTab}
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
          />
        )}

        {currentTab === 'spends' && (
          <ExpenditureView
            summary={summary}
            transactions={transactions}
            currency={profile.currency}
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
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
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
          />
        )}

        {currentTab === 'business' && (
          <BusinessTrackerView
            summary={summary}
            businessTransactions={transactions.filter((t) => t.pocket === 'business' || t.toPocket === 'business')}
            currency={profile.currency}
            onUpdateBusinessBalance={handleUpdateBusinessBalance}
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
            onTransferToPersonal={handleTransferBusinessToPersonal}
          />
        )}

        {currentTab === 'copilot' && (
          <AiCopilotView
            summary={summary}
            currency={profile.currency}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
          />
        )}
      </main>

      {/* Quick Entry Keypad Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onAddTransaction={handleAddTransaction}
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
      />
    </div>
  );
}
