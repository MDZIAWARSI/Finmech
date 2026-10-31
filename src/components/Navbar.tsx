'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  Target,
  PieChart as PieIcon
} from 'lucide-react';

export type NavTab = 'dashboard' | 'spends' | 'cash' | 'business' | 'copilot';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  onOpenTargetModal: () => void;
  userName?: string;
  savingsPercentage?: number;
}

export function Navbar({
  currentTab,
  onTabChange,
  onOpenQuickEntry,
  onOpenTargetModal,
  userName = 'Zia',
  savingsPercentage = 0,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'spends' as NavTab, label: 'Spends', icon: PieIcon },
    { id: 'cash' as NavTab, label: 'Cash', icon: Banknote },
    { id: 'business' as NavTab, label: 'Business', icon: Briefcase },
    { id: 'copilot' as NavTab, label: 'AI Copilot', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#fafafa]/80 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* User profile & App branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm select-none">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  FINMECH
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium">
                  v2.0
                </span>
              </div>
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                Hi, {userName}
              </h1>
            </div>
          </div>

          {/* Right Action Capsule */}
          <div className="flex items-center gap-2">
            {/* Quick Savings Target Pill */}
            <button
              onClick={onOpenTargetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
              title="Adjust Savings Goal"
            >
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span className="tabular-nums">{savingsPercentage}%</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock with Sliding Animated Active Pill */}
      <nav
        aria-label="Bottom navigation dock"
        className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center"
      >
        <div className="bg-white/80 dark:bg-[#121215]/85 backdrop-blur-2xl border border-neutral-200/60 dark:border-neutral-800/70 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-full p-1.5 flex items-center gap-1 pointer-events-auto">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative px-3.5 py-2.5 rounded-full flex flex-col items-center justify-center text-xs transition-colors group focus:outline-none"
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive
                      ? 'text-white dark:text-neutral-900'
                      : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
                  }`}
                />
              </button>
            );
          })}

          {/* Center Elevated Quick Add Button with pop interaction */}
          <button
            onClick={onOpenQuickEntry}
            className="w-11 h-11 mx-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative px-3.5 py-2.5 rounded-full flex flex-col items-center justify-center text-xs transition-colors group focus:outline-none"
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive
                      ? 'text-white dark:text-neutral-900'
                      : item.id === 'copilot'
                      ? 'text-emerald-500'
                      : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
