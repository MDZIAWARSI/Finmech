'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Database, 
  Landmark, 
  Briefcase, 
  Banknote,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SignInGateProps {
  onContinueAsGuest?: () => void;
}

export function SignInGate({ onContinueAsGuest }: SignInGateProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was interrupted. Please ensure popups are enabled and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name || 'User');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar Branding */}
      <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-extrabold text-sm shadow-xs">
            F
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-widest text-neutral-900 dark:text-white">
              FINMECH
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium">
              v2.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure Vault</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-850/80 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-800 shadow-xs mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Sign In Required
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Your financial ledger is strictly isolated and keyed to your signed-in account.
          </p>
        </div>

        {/* 3 Pillars / Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-xs">
            <Landmark className="w-4 h-4 mx-auto text-neutral-700 dark:text-neutral-300" />
            <div className="text-[11px] font-bold text-neutral-900 dark:text-white">Bank Log</div>
            <div className="text-[10px] text-neutral-400 leading-tight">Zero drift</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-xs">
            <Banknote className="w-4 h-4 mx-auto text-neutral-700 dark:text-neutral-300" />
            <div className="text-[11px] font-bold text-neutral-900 dark:text-white">Cash Wallet</div>
            <div className="text-[10px] text-neutral-400 leading-tight">Denominations</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-xs">
            <Briefcase className="w-4 h-4 mx-auto text-neutral-700 dark:text-neutral-300" />
            <div className="text-[11px] font-bold text-neutral-900 dark:text-white">Live Business</div>
            <div className="text-[10px] text-neutral-400 leading-tight">Draws & Capital</div>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: 1-Tap Google Sign In */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSubmitting ? 'Authenticating...' : 'Sign in with Google'}</span>
          </button>

          {/* Email Sign In Toggle */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-2.5 text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Sign in with Email or Password →
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200/80 dark:border-neutral-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      tab === 'signin'
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      tab === 'signup'
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-400'
                    }`}
                  >
                    Register
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Hide
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-2.5">
                {tab === 'signup' && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email Address"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

          {/* Optional offline fallback */}
          {onContinueAsGuest && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 underline underline-offset-4"
              >
                Or continue as Local Guest (Offline storage on this device)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer isolation guarantee */}
      <div className="max-w-md w-full mx-auto pb-4 text-center">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
          Bank-grade data isolation. All entries are encrypted and tied strictly to your authenticated key. When you sign out, session data is instantly cleared.
        </p>
      </div>
    </div>
  );
}

