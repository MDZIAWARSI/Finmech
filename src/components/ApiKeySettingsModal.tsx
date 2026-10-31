'use client';

import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Lock,
} from 'lucide-react';
import { ApiKeyConfig } from '@/types/finance';
import { GeminiService } from '@/lib/gemini';
import { StorageService } from '@/lib/storage';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyConfig: ApiKeyConfig;
  onUpdateKeyConfig: (config: ApiKeyConfig) => void;
}

export default function ApiKeySettingsModal({
  isOpen,
  onClose,
  apiKeyConfig,
  onUpdateKeyConfig,
}: ApiKeySettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKeyConfig.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim();
    if (!clean) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid API key.' });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    const result = await GeminiService.verifyApiKey(clean);
    setIsVerifying(false);

    if (result.valid) {
      StorageService.saveApiKey(clean, true);
      const newConfig = {
        geminiApiKey: clean,
        isValidated: true,
        lastChecked: new Date().toISOString(),
      };
      onUpdateKeyConfig(newConfig);
      setStatusMessage({
        type: 'success',
        text: 'API Key verified and stored securely in local browser vault!',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to verify key with Gemini API. Please check for typos.',
      });
    }
  };

  const handleClearKey = () => {
    StorageService.clearApiKey();
    onUpdateKeyConfig({ geminiApiKey: '', isValidated: false });
    setKeyInput('');
    setStatusMessage({ type: 'success', text: 'API Key removed. Reverted to Free Offline AI mode.' });
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <Key className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Protected API Key</h2>
              <p className="text-xs text-[var(--text-muted)]">Private AI intelligence engine</p>
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

        {/* Protection Shield Banner */}
        <div className="mt-4 rounded-2xl bg-[var(--bg-surface-elevated)] p-3.5 border border-[var(--border-color)] flex items-start gap-3">
          <Lock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-bold text-emerald-500 block mb-0.5">
              Zero Leakage Guarantee
            </span>
            Your API key never leaves your device. It is stored solely in local browser storage and used directly for Google Gemini API inference.
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-3 pr-12 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
                aria-label="Google Gemini API Key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 text-[11px] min-h-[36px]"
            >
              <span>Get free key from Google AI Studio</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            {apiKeyConfig.isValidated && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 text-[11px] min-h-[36px]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remove Key</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-transform duration-150 active:scale-[0.96] shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Verify & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
