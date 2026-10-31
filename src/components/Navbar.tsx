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
  Home,
  PieChart,
  Sun,
  Moon,
  Sparkle,
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
}: NavbarProps) {
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'business', label: 'Division', icon: Briefcase },
    { id: 'expenditure', label: 'Spends', icon: PieChart },
    { id: 'ai', label: 'Copilot', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header Bar: Minimal Monochrome */}
      <header className="sticky top-0 z-30 bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-150">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* User Profile trigger */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-3 text-left transition-transform duration-120 active:scale-[0.98]"
            aria-label="User Profile"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium leading-none">
                <span>Welcome back</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" title="Live Sync Active" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight mt-1 leading-none">
                {profile.name || 'Alex'}
              </h2>
            </div>
          </button>

          {/* Center Navigation on Desktop */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-[var(--bg-surface-elevated)] p-1 border border-[var(--border-color)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-120 ${
                    isActive
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Theme switch & API key */}
          <div className="flex items-center gap-2">
            {/* Quick Add CTA on desktop */}
            <button
              onClick={onOpenQuickAdd}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] px-3.5 py-1.5 text-xs font-bold hover:opacity-90 transition-transform duration-120 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Entry</span>
            </button>

            {/* Monochrome 3-mode theme switcher */}
            <div
              className="flex items-center rounded-full bg-[var(--bg-surface-elevated)] p-0.5 border border-[var(--border-color)]"
              role="group"
              aria-label="Theme switcher"
            >
              <button
                onClick={() => setTheme('light')}
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  theme === 'light'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Light Mode"
                aria-label="Light mode"
              >
                <Sun className="h-3 w-3" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  theme === 'dark'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Dark Mode"
                aria-label="Dark mode"
              >
                <Moon className="h-3 w-3" />
              </button>
              <button
                onClick={() => setTheme('midnight')}
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  theme === 'midnight'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Midnight OLED"
                aria-label="Midnight OLED mode"
              >
                <Sparkle className="h-3 w-3" />
              </button>
            </div>

            {/* API Key Status */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                apiKeyConfig.isValidated
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="API Key Settings"
              aria-label="API Key Settings"
            >
              <Key className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Modern Monochrome Capsule Dock (Mobile & Tablet) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm">
        <div className="flex items-center justify-between rounded-full bg-[var(--dock-bg)] border border-[var(--dock-border)] backdrop-blur-2xl p-1.5 shadow-[var(--shadow-dock)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-full py-2 px-2.5 text-xs font-semibold transition-all duration-120 min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Quick Plus Action Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 transition-transform duration-120 active:scale-90 shrink-0"
            aria-label="Quick Add Entry"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
