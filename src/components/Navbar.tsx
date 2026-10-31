'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PieChart as PieIcon,
  X,
  ArrowRight
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
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const aiButtonRef = useRef<HTMLDivElement>(null);

  // Auto-collapse if user doesn't click again within 4.5 seconds
  useEffect(() => {
    if (!isAiExpanded) return;
    const timer = setTimeout(() => {
      setIsAiExpanded(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [isAiExpanded]);

  // Collapse if user clicks outside
  useEffect(() => {
    if (!isAiExpanded) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (aiButtonRef.current && !aiButtonRef.current.contains(e.target as Node)) {
        setIsAiExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isAiExpanded]);

  // Two-step click protection: 1st click reveals "Finmech AI", 2nd click opens AI copilot
  const handleAiClick = () => {
    if (currentTab === 'copilot') {
      onTabChange('dashboard');
      setIsAiExpanded(false);
    } else if (!isAiExpanded) {
      setIsAiExpanded(true);
    } else {
      onTabChange('copilot');
      setIsAiExpanded(false);
    }
  };

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

      {/* Floating AI Button ("ai should just be an icon when clicked it should say finmech ai then if i clikc agian the page opens") */}
      <div ref={aiButtonRef} className="fixed bottom-24 right-4 sm:right-8 z-40 pointer-events-auto">
        <motion.button
          layout
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAiClick}
          className={`relative flex items-center justify-center transition-all border shadow-[0_12px_30px_rgba(0,0,0,0.22)] dark:shadow-[0_12px_30px_rgba(255,255,255,0.18)] focus:outline-none ${
            currentTab === 'copilot'
              ? 'h-11 px-4 rounded-full bg-emerald-500 text-white border-emerald-400 gap-1.5'
              : isAiExpanded
              ? 'h-11 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-700/60 dark:border-neutral-300/60 gap-2'
              : 'w-11 h-11 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-700/60 dark:border-neutral-300/60'
          }`}
          aria-label={
            currentTab === 'copilot'
              ? 'Close AI Copilot'
              : isAiExpanded
              ? 'Confirm and open Finmech AI'
              : 'Finmech AI'
          }
          title={
            currentTab === 'copilot'
              ? 'Close AI'
              : isAiExpanded
              ? 'Click again to open'
              : 'Finmech AI'
          }
        >
          {currentTab === 'copilot' ? (
            <>
              <X className="w-4 h-4 text-white shrink-0" />
              <span className="text-xs font-bold tracking-tight">Close AI</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-500 shrink-0" />
              <AnimatePresence>
                {isAiExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-1 overflow-hidden whitespace-nowrap select-none"
                  >
                    <span className="text-xs font-bold tracking-tight">Finmech AI</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500 ml-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.button>
      </div>

      {/* Sleek, Compact Floating Bottom Navigation Dock:
          - Hugs contents snugly with zero empty void
          - Refined dimensions (48px sleek height, ~255px width)
          - Elevated, tactile center + button perfectly proportioned
          - Fluid spring transitions when switching tabs
      */}
      <nav
        aria-label="Bottom navigation dock"
        className="fixed bottom-5 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center"
      >
        <motion.div 
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="bg-white/90 dark:bg-[#121215]/90 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] rounded-full p-1.5 flex items-center gap-1 sm:gap-1.5 pointer-events-auto"
        >
          {/* Left 2 Tabs (Overview, Spends) */}
          {leftTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative h-9.5 rounded-full flex items-center justify-center gap-1.5 text-xs transition-colors group focus:outline-none shrink-0 ${
                  isActive ? 'px-3.5' : 'w-9'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 relative z-10 transition-colors shrink-0 ${
                    isActive
                      ? 'text-white dark:text-neutral-900'
                      : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
                  }`}
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="relative z-10 font-bold text-xs whitespace-nowrap text-white dark:text-neutral-900 overflow-hidden select-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}

          {/* Center Elevated Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenQuickEntry}
            className="w-10.5 h-10.5 mx-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0 focus:outline-none"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </motion.button>

          {/* Right 2 Tabs (Cash, Business) */}
          {rightTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative h-9.5 rounded-full flex items-center justify-center gap-1.5 text-xs transition-colors group focus:outline-none shrink-0 ${
                  isActive ? 'px-3.5' : 'w-9'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 relative z-10 transition-colors shrink-0 ${
                    isActive
                      ? 'text-white dark:text-neutral-900'
                      : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
                  }`}
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="relative z-10 font-bold text-xs whitespace-nowrap text-white dark:text-neutral-900 overflow-hidden select-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </motion.div>
      </nav>
    </>
  );
}
