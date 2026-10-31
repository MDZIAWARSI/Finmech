'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import CashInHandView from '@/components/CashInHandView';
import BusinessTrackerView from '@/components/BusinessTrackerView';
import ExpenditureView from '@/components/ExpenditureView';
import AiAdvisorView from '@/components/AiAdvisorView';
import QuickInputModal from '@/components/QuickInputModal';
import ApiKeySettingsModal from '@/components/ApiKeySettingsModal';
import AuthModal from '@/components/AuthModal';
import { Plus } from 'lucide-react';

import { Transaction, UserProfile, ApiKeyConfig } from '@/types/finance';
import { StorageService, DEFAULT_PROFILE, INITIAL_TRANSACTIONS } from '@/lib/storage';
import { calculateFinancialSummary } from '@/lib/financeCalculations';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig>({
    geminiApiKey: '',
    isValidated: false,
  });

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadedTx = StorageService.getTransactions();
    const loadedProfile = StorageService.getProfile();
    const loadedKeyConfig = StorageService.getApiKeyConfig();

    setTransactions(loadedTx);
    setProfile(loadedProfile);
    setApiKeyConfig(loadedKeyConfig);

    // Sync with server-side file DB in background
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.transactions) && data.transactions.length > 0) {
          // If server has more data or fresh session
        }
      })
      .catch(() => {});

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
      setDeferredPrompt(null);
    }
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const created = StorageService.addTransaction(newTxData);
    setTransactions((prev) => [created, ...prev]);

    // Background sync to server API
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: created }),
    }).catch(() => {});
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = StorageService.deleteTransaction(id);
    setTransactions(updated);

    // Background sync
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: updated }),
    }).catch(() => {});
  };

  // Financial calculations
  const summary = calculateFinancialSummary(transactions, profile.monthlyBudget);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] text-emerald-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono font-bold tracking-wider">FINMECH ENGINE STARTING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-500 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        profile={profile}
        apiKeyConfig={apiKeyConfig}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            summary={summary}
            transactions={transactions}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'cash' && (
          <CashInHandView
            summary={summary}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === 'business' && (
          <BusinessTrackerView
            summary={summary}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === 'expenditure' && (
          <ExpenditureView
            summary={summary}
            transactions={transactions}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisorView
            summary={summary}
            transactions={transactions}
            apiKeyConfig={apiKeyConfig}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Quick Input Modal */}
      <QuickInputModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTransaction={handleAddTransaction}
        apiKey={apiKeyConfig.geminiApiKey}
      />

      {/* Protected API Key Modal */}
      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKeyConfig={apiKeyConfig}
        onUpdateKeyConfig={setApiKeyConfig}
      />

      {/* Email Login & OTP Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />
    </div>
  );
}
