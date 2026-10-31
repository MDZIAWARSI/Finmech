'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Key,
  AlertCircle,
  Lightbulb,
  Send,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import { FinancialSummary } from '@/lib/financeCalculations';
import { Transaction, ApiKeyConfig, AiSavingSuggestion, ChatMessage } from '@/types/finance';
import { GeminiService } from '@/lib/gemini';

interface AiAdvisorViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  apiKeyConfig: ApiKeyConfig;
  onOpenApiKeyModal: () => void;
}

export default function AiAdvisorView({
  summary,
  transactions,
  apiKeyConfig,
  onOpenApiKeyModal,
}: AiAdvisorViewProps) {
  const [suggestions, setSuggestions] = useState<AiSavingSuggestion[]>([]);
  const [executiveReport, setExecutiveReport] = useState<string>('');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `👋 Hey Alex, I'm your FINMECH Financial Copilot. I analyze your live expenditures, cash in hand (₹${summary.cashInHand}), and business division (₹${summary.businessBalance}) to find where cash is leaking and how to save. What would you like to review?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runAudit();
  }, [transactions.length]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const runAudit = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await GeminiService.generateSavingsAudit(
        summary,
        transactions,
        apiKeyConfig.geminiApiKey
      );
      setSuggestions(res.suggestions);
      setExecutiveReport(res.summaryReport);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isAiReplying) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsAiReplying(true);

    try {
      const reply = await GeminiService.askFinancialCopilot(
        textToSend,
        summary,
        transactions,
        chatMessages.map((m) => ({ role: m.role, content: m.content })),
        apiKeyConfig.geminiApiKey
      );

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach Gemini right now. Heuristic analysis remains active on your dashboard.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleCopyReport = () => {
    const textToCopy = `=== FINMECH AI Financial Health Report ===\nTotal Net Worth: ₹${summary.totalNetWorth.toLocaleString('en-IN')}\nCash in Hand: ₹${summary.cashInHand.toLocaleString('en-IN')}\nBusiness Division: ₹${summary.businessBalance.toLocaleString('en-IN')}\nMonthly Expenditure: ₹${summary.monthlyExpenditure.toLocaleString('en-IN')}\nDaily Burn: ₹${summary.dailyAverageSpend}/day\n\nDiagnostic Summary:\n${executiveReport}\n\nTop Savings:\n${suggestions.map((s, i) => `${i + 1}. ${s.title} (Save ₹${s.potentialMonthlySavings}/mo): ${s.actionableStep}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const totalPotentialSavings = suggestions.reduce(
    (acc, s) => acc + s.potentialMonthlySavings,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-28">
      {/* Hero Diagnostic Card (Minimal Monochrome) */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Spending Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
              Where Money Leaks & How to Save
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-lg leading-relaxed">
              Audits physical cash notes, digital bank UPI, and business division to flag leakage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                apiKeyConfig.isValidated
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>{apiKeyConfig.isValidated ? 'Gemini 2.5 Active' : 'Free Heuristic Mode'}</span>
            </button>

            <button
              onClick={runAudit}
              disabled={isLoadingAudit}
              className="p-2 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--border-color-hover)] transition-all"
              title="Rerun Analysis"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Diagnostic Text & Savings */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
              Diagnostic Summary
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isLoadingAudit ? 'Auditing transaction streams...' : executiveReport}
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface-elevated)] px-4 py-2 border border-[var(--border-color)] text-right sm:text-left shrink-0">
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">Estimated Monthly Retain</span>
            {/* Subtle green tint for positive savings */}
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              +₹{totalPotentialSavings.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Fixes Grid (Minimal Monochrome) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Targeted Opportunities</h2>
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((sug) => {
            const isHigh = sug.severity === 'high';
            return (
              <div
                key={sug.id}
                className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 sm:p-5 shadow-[var(--shadow-card)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHigh
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {sug.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +₹{sug.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-2">{sug.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {sug.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--text-primary)] leading-snug">
                    {sug.actionableStep}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Interactive Copilot Chat */}
      <div className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 sm:p-5 shadow-[var(--shadow-card)] flex flex-col h-[460px]">
        <div className="pb-3 border-b border-[var(--border-color)] shrink-0">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Copilot Chat</h3>
          <p className="text-xs text-[var(--text-muted)]">Ask questions regarding your burn rate and division</p>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)]'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)]'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {isAiReplying && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[var(--bg-surface-elevated)] px-4 py-2.5 text-xs text-[var(--text-muted)] animate-pulse border border-[var(--border-color)]">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-2 border-t border-[var(--border-color)] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Copilot..."
            style={{ fontSize: '16px' }}
            className="flex-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[42px]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiReplying}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] disabled:opacity-30 transition-transform active:scale-95 shrink-0"
            aria-label="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
