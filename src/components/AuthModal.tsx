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
      setSuccessMsg(`OTP dispatched! Free test code: ${res.simulatedCode}`);
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
      setSuccessMsg('Signed in successfully!');
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {profile.isLoggedIn ? 'Account Profile' : 'Email & OTP Sign In'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">100% Free authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-transform duration-150 active:scale-[0.94] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* If user is already logged in */}
        {profile.isLoggedIn ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-color)] flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-lg font-black">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{profile.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{profile.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>Session Active & Synced</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)]">
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">Monthly Budget</span>
                <p className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5 tabular-nums">
                  ₹{profile.monthlyBudget.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--bg-surface-elevated)] p-3 border border-[var(--border-color)]">
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">Cash Target</span>
                <p className="text-sm font-extrabold text-amber-500 mt-0.5 tabular-nums">
                  ₹{profile.cashEmergencyTarget.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-rose-500/15 border border-rose-500/40 py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/25 flex items-center justify-center gap-1.5 transition-transform duration-150 active:scale-[0.96] min-h-[44px]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="mt-4 space-y-4">
            {/* Free Instant OTP Banner */}
            {simulatedCode && (
              <div className="rounded-2xl bg-indigo-500/15 p-3.5 border border-indigo-500/40 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Free Instant OTP Generated:
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-600 min-h-[36px]"
                  >
                    {copiedCode ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                    <span>{copiedCode ? 'Auto-filled' : 'Copy & Auto-fill'}</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-[var(--bg-surface)] px-3.5 py-2 border border-[var(--border-color)]">
                  <span className="text-lg font-mono font-black text-[var(--text-primary)] tracking-widest tabular-nums">
                    {simulatedCode}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Valid for 10 min</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-500/15 border border-rose-500/40 p-3.5 text-xs font-semibold text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or founder@startup.io"
                    className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-page)] py-3 text-xs font-bold hover:opacity-90 transition-all active:scale-[0.98] min-h-[46px]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Send Free Login Code (OTP)</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[36px]"
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
                    className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 text-center text-xl font-mono font-black tracking-widest text-[var(--text-primary)] focus:outline-none min-h-[48px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-page)] py-3 text-xs font-bold hover:opacity-90 transition-all active:scale-[0.98] min-h-[46px]"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
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
