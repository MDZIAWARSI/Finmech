'use client';

import React from 'react';
import {
  Wallet,
  Briefcase,
  Banknote,
  Sparkles,
  Key,
  User,
  Plus,
  TrendingUp,
  CreditCard,
  Sun,
  Moon,
  Sparkle,
  Bell,
  Home,
  SlidersHorizontal,
  PieChart,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { UserProfile, ApiKeyConfig } from '@/types/finance';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: FinancialSummary;
  profile: UserProfile;
  apiKeyConfig: ApiKeyConfig;
  onOpenQuickAdd: () => void;
  onOpenApiKeyModal: () => void;
  onOpenAuthModal: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  summary,
  profile,
  apiKeyConfig,
  onOpenQuickAdd,
  onOpenApiKeyModal,
  onOpenAuthModal,
  canInstallPwa,
  onInstallPwa,
}: NavbarProps) {
  const { theme, setTheme, cycleTheme } = useTheme();

  const tabs = [
    { id: 'overview', label: 'Home', icon: Home },
    {
      id: 'cash',
      label: 'Cash',
      icon: Banknote,
      badge: `₹${summary.cashInHand.toLocaleString('en-IN')}`,
    },
    {
      id: 'business',
      label: 'Biz Division',
      icon: Briefcase,
      badge: `₹${summary.businessBalance.toLocaleString('en-IN')}`,
    },
    { id: 'expenditure', label: 'Spends', icon: PieChart },
    { id: 'ai', label: 'Copilot', icon: Sparkles, highlight: true },
  ];

  return (
    <>
      {/* Top Header Bar (Matching Images 1, 2, 3, 5) */}
      <header className="sticky top-0 z-30 bg-[var(--bg-page)]/85 backdrop-blur-xl border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: User Avatar + Welcome Greeting (Images 1, 2, 3, 5) */}
          <div
            onClick={onOpenAuthModal}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-md shadow-emerald-500/15 group-hover:scale-105 transition-transform duration-150">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-surface)] text-xs font-black text-emerald-500">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
                <span>Welcome back</span>
                <span className="select-none">👋</span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                {profile.name || 'Alex'}
              </h2>
            </div>
          </div>

          {/* Center Navigation on Desktop Viewports */}
          <nav className="hidden lg:flex items-center gap-1.5 rounded-full bg-[var(--bg-surface-elevated)] p-1.5 border border-[var(--border-color)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Add CTA on larger screens */}
            <button
              onClick={onOpenQuickAdd}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-transform duration-150 active:scale-95 min-h-[40px]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Spend</span>
            </button>

            {/* Theme Mode Selector Pill */}
            <div
              className="flex items-center rounded-full bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]"
              role="group"
              aria-label="Theme switcher"
            >
              <button
                onClick={() => setTheme('light')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Light Mode"
                aria-label="Light theme"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  theme === 'dark'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Dark Mode"
                aria-label="Dark theme"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme('midnight')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  theme === 'midnight'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Midnight OLED"
                aria-label="Midnight OLED theme"
              >
                <Sparkle className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Gemini API Key Settings Icon */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-150 active:scale-95 ${
                apiKeyConfig.isValidated
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Protected AI Key Settings"
              aria-label="Protected AI Key Settings"
            >
              <Key className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Modern Capsule Dock Navigation (Images 1, 2, 3, 5) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
        <div className="flex items-center justify-between rounded-full bg-[var(--dock-bg)] border border-[var(--dock-border)] backdrop-blur-2xl p-1.5 shadow-[var(--shadow-dock)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-full py-2 px-3 text-xs font-bold transition-all duration-150 min-h-[44px] ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm scale-[1.02]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold tracking-tight">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Quick Center Add Button inside the floating dock */}
          <button
            onClick={onOpenQuickAdd}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-transform duration-150 active:scale-90 shrink-0"
            aria-label="Quick Add Expense"
            title="Add transaction"
          >
            <Plus className="h-5 w-5 font-bold" />
          </button>
        </div>
      </div>
    </>
  );
}
