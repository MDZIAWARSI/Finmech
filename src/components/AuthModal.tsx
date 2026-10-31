'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  LogOut,
  User,
  Shield,
  Sparkles,
  Send,
} from 'lucide-react';
import { UserProfile } from '@/types/finance';
import { AuthService } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}: AuthModalProps) {
  const [email, setEmail] = useState(profile.email || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = AuthService.requestOtp(email);
    if (res.success) {
      setSimulatedCode(res.simulatedCode);
      setStep('otp');
      setSuccessMsg(`OTP sent! Use free code: ${res.simulatedCode}`);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = AuthService.verifyOtp(email, otp);
    if (res.success && res.profile) {
      onUpdateProfile(res.profile);
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
        setStep('email');
        setOtp('');
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleCopyCode = () => {
    if (!simulatedCode) return;
    navigator.clipboard.writeText(simulatedCode);
    setOtp(simulatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLogout = () => {
    const updated = AuthService.logout();
    onUpdateProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-2xl shadow-emerald-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {profile.isLoggedIn ? 'Account Profile' : 'Email & OTP Sign In'}
              </h2>
              <p className="text-xs text-slate-400">100% Free authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* If user is already logged in */}
        {profile.isLoggedIn ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                <p className="text-xs text-slate-400 truncate">{profile.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Session Active & Synced</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-slate-900/60 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400">Monthly Budget</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  ₹{profile.monthlyBudget.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/60 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400">Cash Emergency Target</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">
                  ₹{profile.cashEmergencyTarget.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-rose-500/20 border border-rose-500/40 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="mt-4 space-y-4">
            {/* Free Instant OTP Banner */}
            {simulatedCode && (
              <div className="rounded-2xl bg-indigo-950/60 p-3.5 border border-indigo-500/40 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300">
                      Free Instant OTP Generated:
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedCode ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCode ? 'Auto-filled' : 'Copy & Auto-fill'}</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 border border-slate-700">
                  <span className="text-lg font-mono font-black text-white tracking-widest">
                    {simulatedCode}
                  </span>
                  <span className="text-[10px] text-slate-400">Valid for 10 min</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-500/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or founder@startup.io"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Free Login Code (OTP)</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-3 text-center text-xl font-mono font-bold tracking-widest text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Verify Code & Sign In</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
