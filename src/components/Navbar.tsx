'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Plus, 
  Banknote, 
  Briefcase, 
  Sparkles, 
  Sun, 
  Moon, 
  Target 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'spends' | 'cash' | 'business' | 'copilot';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  onOpenTargetModal: () => void;
  userName?: string;
}

export function Navbar({
  currentTab,
  onTabChange,
  onOpenQuickEntry,
  onOpenTargetModal,
  userName = 'Zia',
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#fafafa]/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-black/[0.04] dark:border-white/[0.06] transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* User profile & App branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold text-sm shadow-sm select-none">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                finmech
              </div>
              <h1 className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                Hi, {userName}
              </h1>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenTargetModal}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Set savings target"
              title="Set Savings Target"
            >
              <Target className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Capsule Dock */}
      <nav
        aria-label="Bottom navigation"
        className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none"
      >
        <div className="max-w-md mx-auto bg-white/90 dark:bg-[#141417]/90 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-3 py-2 flex items-center justify-between pointer-events-auto">
          {/* Overview */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              currentTab === 'dashboard'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            aria-label="Dashboard overview"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Home</span>
          </button>

          {/* Spends */}
          <button
            onClick={() => onTabChange('spends')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              currentTab === 'spends'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            aria-label="Expenditures"
          >
            <ReceiptText className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Spends</span>
          </button>

          {/* Elevated Center Quick Entry Button */}
          <button
            onClick={onOpenQuickEntry}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md hover:scale-105 active:scale-95 transition-transform"
            aria-label="Quick Add Transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Cash in Hand */}
          <button
            onClick={() => onTabChange('cash')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              currentTab === 'cash'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            aria-label="Cash in hand tracker"
          >
            <Banknote className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Cash</span>
          </button>

          {/* Business Tracker */}
          <button
            onClick={() => onTabChange('business')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              currentTab === 'business'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            aria-label="Live business money"
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Business</span>
          </button>

          {/* AI Copilot */}
          <button
            onClick={() => onTabChange('copilot')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              currentTab === 'copilot'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            aria-label="AI Financial Copilot"
          >
            <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-[10px] font-medium mt-0.5">AI</span>
          </button>
        </div>
      </nav>
    </>
  );
}
