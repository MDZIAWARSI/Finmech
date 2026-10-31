'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Check, ShieldCheck, Database, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'setup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configText, setConfigText] = useState('');
  const [setupSuccess, setSetupSuccess] = useState(false);

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      let configToSave: any = null;

      try {
        const parsed = JSON.parse(configText.trim());
        if (parsed.apiKey && parsed.projectId) {
          configToSave = parsed;
        }
      } catch {}

      if (!configToSave) {
        const apiKeyMatch = configText.match(/apiKey["']?\s*:\s*["']([^"']+)["']/i) || configText.match(/AIzaSy[a-zA-Z0-9_\-]+/);
        const projectIdMatch = configText.match(/projectId["']?\s*:\s*["']([^"']+)["']/i);
        const authDomainMatch = configText.match(/authDomain["']?\s*:\s*["']([^"']+)["']/i);
        const storageBucketMatch = configText.match(/storageBucket["']?\s*:\s*["']([^"']+)["']/i);
        const appIdMatch = configText.match(/appId["']?\s*:\s*["']([^"']+)["']/i);
        const senderIdMatch = configText.match(/messagingSenderId["']?\s*:\s*["']([^"']+)["']/i);

        if (apiKeyMatch && projectIdMatch) {
          configToSave = {
            apiKey: apiKeyMatch[1] || apiKeyMatch[0],
            projectId: projectIdMatch[1],
            authDomain: authDomainMatch ? authDomainMatch[1] : `${projectIdMatch[1]}.firebaseapp.com`,
            storageBucket: storageBucketMatch ? storageBucketMatch[1] : `${projectIdMatch[1]}.appspot.com`,
            messagingSenderId: senderIdMatch ? senderIdMatch[1] : '',
            appId: appIdMatch ? appIdMatch[1] : '',
          };
        }
      }

      if (!configToSave || !configToSave.apiKey || !configToSave.projectId) {
        throw new Error('Please paste your valid Firebase Web Config snippet (must contain apiKey and projectId).');
      }

      localStorage.setItem('finmech_firebase_config', JSON.stringify(configToSave));
      setSetupSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse Firebase config.');
    }
  };

  const handleClearConfig = () => {
    localStorage.removeItem('finmech_firebase_config');
    window.location.reload();
  };

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed. Ensure localhost is an authorized domain in Firebase Console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#141417] rounded-t-3xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
                {user ? 'Account & Cloud Sync' : 'Sign in to Finmech'}
              </h2>
              <p className="text-xs text-neutral-400">
                {user ? user.email : 'Real-time multi-device cloud backup'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged in state */}
        {user ? (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181b] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Cloud Firestore Real-Time Sync Active
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Your expenditures, physical cash audits, and live business balances are encrypted and synced to your cloud account.
              </p>
            </div>

            <button
              onClick={async () => {
                await signOutUser();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Tab switcher */}
            <div className="flex items-center bg-neutral-100 dark:bg-[#1c1c21] p-1 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 py-1.5 rounded-full transition-all ${
                  tab === 'signin'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 py-1.5 rounded-full transition-all ${
                  tab === 'signup'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setTab('setup')}
                className={`flex-1 py-1.5 rounded-full transition-all ${
                  tab === 'setup'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                DB Setup
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {tab === 'setup' ? (
              <div className="space-y-3 text-xs">
                {isConfigured ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Cloud Firestore Connected
                    </div>
                    <p className="text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed text-[11.5px]">
                      Your permanent cloud database is active. All entries sync to Firestore in real-time.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearConfig}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium transition-colors text-[11px]"
                    >
                      Reset / Disconnect Custom DB
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                      <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-500" />
                        Connect Cloud Firestore
                      </div>
                      <p className="text-neutral-500 leading-relaxed text-[11.5px]">
                        Paste your free Firebase Web App config snippet below to enable permanent cross-device cloud sync:
                      </p>
                      
                      <form onSubmit={handleSaveFirebaseConfig} className="space-y-2.5 pt-1">
                        <textarea
                          rows={4}
                          value={configText}
                          onChange={(e) => setConfigText(e.target.value)}
                          placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "your-project",\n  ...\n};`}
                          className="w-full p-2.5 bg-white dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          Save & Connect Database
                        </button>
                      </form>

                      {setupSuccess && (
                        <div className="p-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          ✓ Configuration saved! Reloading...
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50/60 dark:bg-[#141417]/60 border border-neutral-200/50 dark:border-neutral-800/50 text-[11px] text-neutral-400 leading-relaxed">
                      Or populate <code>.env.local</code> in this repository with your <code>NEXT_PUBLIC_FIREBASE_*</code> keys.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  Continue with Google
                </button>

                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                  <span className="px-2 text-[10px] text-neutral-400 uppercase tracking-wider">or with email</span>
                  <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {tab === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Zia"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="zia@example.com"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isSubmitting ? 'Authenticating...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

