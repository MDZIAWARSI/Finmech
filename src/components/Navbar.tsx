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
  Download,
  ShieldCheck,
  CreditCard,
  Sun,
  Moon,
  Sparkle,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { UserProfile, ApiKeyConfig } from '@/types/finance';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

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
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    {
      id: 'cash',
      label: 'Cash in Hand',
      icon: Banknote,
      badge: `₹${summary.cashInHand.toLocaleString('en-IN')}`,
    },
    {
      id: 'business',
      label: 'Business',
      icon: Briefcase,
      badge: `₹${summary.businessBalance.toLocaleString('en-IN')}`,
    },
    { id: 'expenditure', label: 'Spends', icon: CreditCard },
    { id: 'ai', label: 'AI Copilot', icon: Sparkles, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-page)]/90 backdrop-blur-xl transition-[background-color,border-color] duration-200">
      {/* Top Ticker Bar (Desktop & Tablet) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-1.5 text-xs border-b border-[var(--border-color)] text-[var(--text-secondary)]">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-0.5 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            <span
              className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            <span className="text-[var(--text-muted)]">Net Worth:</span>
            <span className="font-bold text-emerald-500 tabular-nums">
              ₹{summary.totalNetWorth.toLocaleString('en-IN')}
            </span>
          </div>

          <span className="text-[var(--border-color)] select-none">•</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Banknote className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span className="text-[var(--text-muted)]">Cash:</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </span>
          </div>

          <span className="text-[var(--border-color)] select-none">•</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Briefcase className="h-3.5 w-3.5 text-cyan-500" aria-hidden="true" />
            <span className="text-[var(--text-muted)]">Business:</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <span className="text-[var(--border-color)] select-none hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <CreditCard className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            <span className="text-[var(--text-muted)]">Bank:</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{summary.bankBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Tools: Theme Switcher & Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Selector: Light / Dark / Midnight */}
          <div
            className="flex items-center rounded-full bg-[var(--bg-surface-elevated)] p-0.5 border border-[var(--border-color)]"
            role="group"
            aria-label="Theme mode selector"
          >
            <button
              onClick={() => setTheme('light')}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.96] ${
                theme === 'light'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Light Mode"
              aria-label="Switch to Light Mode"
            >
              <Sun className="h-3 w-3" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.96] ${
                theme === 'dark'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Dark Mode (Fintech Slate)"
              aria-label="Switch to Dark Mode"
            >
              <Moon className="h-3 w-3" />
            </button>
            <button
              onClick={() => setTheme('midnight')}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.96] ${
                theme === 'midnight'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Midnight Mode (OLED Pure Black)"
              aria-label="Switch to Midnight OLED Mode"
            >
              <Sparkle className="h-3 w-3" />
            </button>
          </div>

          {/* PWA Install */}
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-semibold transition-transform duration-150 active:scale-[0.96]"
              aria-label="Install FINMECH Progressive Web App"
            >
              <Download className="h-3 w-3" />
              <span>Install PWA</span>
            </button>
          )}

          {/* Protected Key Status */}
          <button
            onClick={onOpenApiKeyModal}
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-transform duration-150 active:scale-[0.96] ${
              apiKeyConfig.isValidated
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
            title={apiKeyConfig.isValidated ? 'Gemini 2.5 Flash Connected' : 'Free AI Mode (Add Key)'}
            aria-label={apiKeyConfig.isValidated ? 'Gemini AI Active' : 'Enter Protected Gemini Key'}
          >
            {apiKeyConfig.isValidated ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Key className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>{apiKeyConfig.isValidated ? 'Gemini AI' : 'Free Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-150">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[var(--bg-surface)]">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg sm:text-xl text-[var(--text-primary)]">
                FINMECH
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] hidden sm:block">
              Mobile-First Money & Business Intelligence
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-1 rounded-2xl bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]"
          aria-label="Main Navigation"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-transform duration-150 active:scale-[0.96] ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-white' : tab.highlight ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span
                    className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 ps-3.5 pe-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
            aria-label="Quick Add Transaction"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Spend</span>
          </button>

          {/* User Profile */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 rounded-2xl bg-[var(--bg-surface-elevated)] p-1.5 sm:px-3 sm:py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-transform duration-150 active:scale-[0.96] min-h-[44px] min-w-[44px]"
            aria-label="User Account Profile"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate text-[var(--text-secondary)]">
              {profile.name || profile.email.split('@')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Ergonomic Bottom-Fixed Bar (Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-color)] px-2 py-1.5 pb-safe flex justify-around items-center shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-transform duration-150 active:scale-[0.94] min-h-[48px] min-w-[48px] ${
                isActive
                  ? 'text-emerald-500 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors duration-150 ${
                  isActive ? 'bg-emerald-500/20 text-emerald-500' : ''
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Quick Theme Switcher Pill in Mobile Navigation */}
        <button
          onClick={cycleTheme}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-transform duration-150 active:scale-[0.94] min-h-[48px] min-w-[48px]"
          title={`Theme: ${theme.toUpperCase()} (Tap to switch)`}
          aria-label={`Current theme is ${theme}. Tap to change theme.`}
        >
          <div className="p-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
            {theme === 'light' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : theme === 'midnight' ? (
              <Sparkle className="h-5 w-5 text-indigo-400" />
            ) : (
              <Moon className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <span className="text-[9px] capitalize">{theme}</span>
        </button>
      </div>
    </header>
  );
}
