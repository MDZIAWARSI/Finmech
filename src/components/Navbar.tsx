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
  PieChart as PieIcon
} from 'lucide-react';

export type NavTab = 'dashboard' | 'spends' | 'cash' | 'business' | 'copilot';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  onOpenAuthModal?: () => void;
  userName?: string;
  userPhoto?: string | null;
  userEmail?: string | null;
}

export function Navbar({
  currentTab,
  onTabChange,
  onOpenQuickEntry,
  onOpenAuthModal,
  userName = 'Zia',
  userPhoto,
  userEmail,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  // 4 balanced navigation tabs: 2 on left, 2 on right
  const leftTabs = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'spends' as NavTab, label: 'Spends', icon: PieIcon },
  ];

  const rightTabs = [
    { id: 'cash' as NavTab, label: 'Cash', icon: Banknote },
    { id: 'business' as NavTab, label: 'Business', icon: Briefcase },
  ];

  return (
    <>
      {/* Top Header Bar (Ultra Clean, No Cryptic Pills) */}
      <header className="sticky top-0 z-30 w-full bg-[#fafafa]/80 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* User profile & App branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuthModal}
              className="relative group focus:outline-none"
              title={userEmail ? `Signed in as ${userEmail}` : 'Sign in / Cloud Sync'}
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm select-none group-hover:scale-105 transition-transform">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  FINMECH
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium">
                  v2.0
                </span>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="text-left text-sm font-bold text-neutral-900 dark:text-white leading-tight hover:opacity-80 transition-opacity"
              >
                Hi, {userName}
              </button>
            </div>
          </div>

          {/* Right Action: Clean Theme Toggle */}
          <div className="flex items-center gap-2">
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

      {/* Floating AI Button ("ai wala floating button") */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-40 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange(currentTab === 'copilot' ? 'dashboard' : 'copilot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.22)] dark:shadow-[0_12px_30px_rgba(255,255,255,0.18)] border transition-all ${
            currentTab === 'copilot'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-700/60 dark:border-neutral-300/60'
          }`}
          aria-label="Open AI Copilot"
        >
          <Sparkles className={`w-4 h-4 ${currentTab === 'copilot' ? 'text-white' : 'text-emerald-400 dark:text-emerald-500'}`} />
          <span className="text-xs font-bold tracking-tight">
            {currentTab === 'copilot' ? 'Close AI' : 'Finmech AI'}
          </span>
        </motion.button>
      </div>

      {/* Perfectly Symmetrical Bottom Navigation Dock: 2 on Left, Center +, 2 on Right */}
      <nav
        aria-label="Bottom navigation dock"
        className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center"
      >
        <div className="bg-white/80 dark:bg-[#121215]/85 backdrop-blur-2xl border border-neutral-200/60 dark:border-neutral-800/70 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-full p-1.5 flex items-center gap-1 pointer-events-auto">
          {/* Left 2 Tabs (Home, Spends) */}
          {leftTabs.map((item) => {
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

          {/* Center Elevated Quick Add Button with spring pop interaction */}
          <button
            onClick={onOpenQuickEntry}
            className="w-11 h-11 mx-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>

          {/* Right 2 Tabs (Cash, Business) */}
          {rightTabs.map((item) => {
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
        </div>
      </nav>
    </>
  );
}
