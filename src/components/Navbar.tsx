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
  ArrowRight,
  User as UserIcon
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
  userName,
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
                  alt={userName || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200/80 dark:border-neutral-800 shadow-xs group-hover:scale-105 transition-transform"
                />
              ) : userName ? (
                <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm select-none group-hover:scale-105 transition-transform">
                  {userName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-850 text-neutral-400 dark:text-neutral-500 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <UserIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                </div>
              )}
              {userEmail && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
              )}
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
                {userName ? `Hi, ${userName}` : (
                  <span className="text-neutral-500 dark:text-neutral-400 font-semibold hover:text-neutral-900 dark:hover:text-white flex items-center gap-1">
                    Sign in <span className="text-xs">→</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Action: Clean Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 active:scale-95 transition-all shadow-xs touch-manipulation cursor-pointer"
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

      {/* 
        Floating Bottom Island Navigation Dock
          - Unified flex container ensuring 100% equal gaps between every icon and center + button
          - Seamlessly centered on all mobile and desktop viewports
          - Fluid spring physics with Framer Motion layout animations
      */}
      <nav
        aria-label="Bottom navigation dock"
        className="fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-auto pb-[env(safe-area-inset-bottom)]"
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          className="h-[58px] px-2.5 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.8)] rounded-full flex items-center gap-2.5"
        >
          {/* Left Wing Tabs: Overview, Spends */}
          {leftTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative h-[42px] rounded-full flex items-center justify-center gap-1.5 text-xs transition-colors group focus:outline-none shrink-0 ${
                  isActive ? 'px-3.5' : 'w-[42px]'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors shrink-0 ${
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

          {/* Center Elevated Quick Add Button: Exactly equal gap from left and right tabs */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenQuickEntry}
            className="w-[46px] h-[46px] rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.22)] active:scale-90 transition-transform shrink-0 focus:outline-none"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </motion.button>

          {/* Right Wing Tabs: Cash, Business */}
          {rightTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative h-[42px] rounded-full flex items-center justify-center gap-1.5 text-xs transition-colors group focus:outline-none shrink-0 ${
                  isActive ? 'px-3.5' : 'w-[42px]'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors shrink-0 ${
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
