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
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { UserProfile, ApiKeyConfig } from '@/types/finance';

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
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'cash', label: 'Cash in Hand', icon: Banknote, badge: `₹${summary.cashInHand.toLocaleString('en-IN')}` },
    { id: 'business', label: 'Business Money', icon: Briefcase, badge: `₹${summary.businessBalance.toLocaleString('en-IN')}` },
    { id: 'expenditure', label: 'Spends & Leaks', icon: CreditCard },
    { id: 'ai', label: 'AI Copilot', icon: Sparkles, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl transition-all">
      {/* Top Banner Ticker */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs border-b border-slate-800/40 text-slate-400">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Net Worth:</span>
            <span className="font-semibold text-emerald-400">
              ₹{summary.totalNetWorth.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-amber-400" />
            <span>Cash in Hand:</span>
            <span className="font-medium text-slate-200">
              ₹{summary.cashInHand.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
            <span>Business:</span>
            <span className="font-medium text-slate-200">
              ₹{summary.businessBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
            <span>Bank:</span>
            <span className="font-medium text-slate-200">
              ₹{summary.bankBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Status / Quick Action badges */}
        <div className="hidden sm:flex items-center gap-2.5">
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[11px]"
            >
              <Download className="h-3 w-3" />
              <span>Install PWA</span>
            </button>
          )}

          {/* Protected API Key Status */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border transition-all ${
              apiKeyConfig.isValidated
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/40'
            }`}
            title={apiKeyConfig.isValidated ? 'Gemini 2.5 Flash Connected' : 'Free Mode / Enter Protected API Key'}
          >
            {apiKeyConfig.isValidated ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Key className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>
              {apiKeyConfig.isValidated ? 'Gemini Active' : 'Free AI / Add Key'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent">
                  FINMECH
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                  PWA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Money, Cash & Business Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/70 p-1 border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {/* Auth / Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
            </div>
            <span className="hidden lg:inline max-w-[100px] truncate text-slate-300">
              {profile.name || profile.email.split('@')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom-Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

