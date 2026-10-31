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
        text: 'API Key verified and saved securely in local protected storage!',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to verify key with Gemini API. Check for typos.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-2xl shadow-emerald-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Protected API Key</h2>
              <p className="text-xs text-slate-400">Your private AI intelligence engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Protection Shield Banner */}
        <div className="mt-4 rounded-2xl bg-emerald-950/40 p-3.5 border border-emerald-500/20 flex items-start gap-3">
          <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400 block mb-0.5">
              Zero Leakage Guarantee
            </span>
            Your API key never leaves your browser. It is encrypted in client-side storage and used directly for Google Gemini API inference.
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
            >
              <span>Get free key from Google AI Studio</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {apiKeyConfig.isValidated && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove Key</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
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

