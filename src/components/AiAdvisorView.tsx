'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Key,
  AlertTriangle,
  Lightbulb,
  Send,
  Bot,
  User,
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

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `👋 Hey! I'm your FINMECH AI Copilot. I analyze your live expenditures, cash in hand (₹${summary.cashInHand}), and business money (₹${summary.businessBalance}) to find where cash is leaking and how to fix it. Ask me anything!`,
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
        isAiGenerated: true,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I hit a momentary network hiccup. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleCopyReport = () => {
    const textToCopy = `=== FINMECH AI Financial Health Report ===\nTotal Net Worth: ₹${summary.totalNetWorth.toLocaleString('en-IN')}\nCash in Hand: ₹${summary.cashInHand.toLocaleString('en-IN')}\nLive Business Money: ₹${summary.businessBalance.toLocaleString('en-IN')} (Margin: ${summary.businessMetrics.profitMargin}%)\nMonthly Expenditure: ₹${summary.monthlyExpenditure.toLocaleString('en-IN')}\nDaily Burn Rate: ₹${summary.dailyAverageSpend}/day\n\nExecutive Diagnosis:\n${executiveReport}\n\nTop Savings Opportunities:\n${suggestions.map((s, i) => `${i + 1}. ${s.title} (Save ₹${s.potentialMonthlySavings}/mo): ${s.actionableStep}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const totalPotentialSavings = suggestions.reduce(
    (acc, s) => acc + s.potentialMonthlySavings,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-surface)] p-6 sm:p-8 border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                FINMECH AI Financial Copilot
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2 tracking-tight">
              Where You Spend More & How to Fix It
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
              Continuous analysis of your expenditure, physical pocket cash, and live business cashflow with tailored fixes.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold border transition-transform duration-150 active:scale-[0.96] min-h-[44px] ${
                apiKeyConfig.isValidated
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-500 border-amber-500/40'
              }`}
              aria-label="Manage Protected API Key"
            >
              {apiKeyConfig.isValidated ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  <span>Gemini 2.5 Flash Connected</span>
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span>Free AI Mode (Add Your Key)</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-[var(--text-muted)]">
              Keys are encrypted in browser sandbox and never leaked.
            </span>
          </div>
        </div>

        {/* Executive Summary Snippet */}
        <div className="mt-6 pt-5 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              AI Diagnostic Verdict:
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isLoadingAudit ? 'Analyzing spending patterns...' : executiveReport}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="rounded-2xl bg-emerald-500/15 px-4 py-2 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Monthly Savings</span>
              <span className="text-lg font-black text-emerald-500 tabular-nums">
                +₹{totalPotentialSavings.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <button
              onClick={runAudit}
              disabled={isLoadingAudit}
              className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500/40 disabled:opacity-50 transition-transform duration-150 active:scale-[0.94] min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Re-run AI Analysis"
              aria-label="Re-run AI Spending Analysis"
            >
              <RotateCw className={`h-4 w-4 ${isLoadingAudit ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Fixes Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Targeted Spending Leaks & Actionable Fixes
            </h2>
          </div>
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[36px]"
            aria-label="Copy AI Financial Report"
          >
            {copiedReport ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {suggestions.map((sug) => {
            const isHigh = sug.severity === 'high';
            return (
              <div
                key={sug.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      }`}
                    >
                      {sug.category}
                    </span>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 tabular-nums">
                      Save ₹{sug.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-2.5">{sug.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {sug.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)] -mx-5 -mb-5 p-4 rounded-b-3xl">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        How to fix this:
                      </p>
                      <p className="text-xs text-[var(--text-primary)] mt-0.5 leading-snug">
                        {sug.actionableStep}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Chat Section (Mobile Optimized) */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 sm:p-6 shadow-[var(--shadow-card)] flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-slate-950 font-bold">
              <Bot className="h-4 w-4 text-slate-950" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">FinMech AI Copilot Chat</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Ask about your budget, purchases, or business</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
            Live Synced
          </span>
        </div>

        {/* Quick Question Pills */}
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-[var(--border-color)]">
          {[
            'Where am I spending more this month?',
            'Can I afford a ₹3,000 purchase today?',
            'How can I boost my business margin?',
            'Give me a 30-day student savings plan',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-full bg-[var(--bg-surface-elevated)] px-3.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-emerald-500 hover:text-emerald-500 whitespace-nowrap transition-transform duration-150 active:scale-[0.96] shrink-0 min-h-[36px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1 no-scrollbar">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className="block text-[9px] opacity-60 mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isAiReplying && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pl-10">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" aria-hidden="true" />
              <span>FinMech AI is analyzing your cashflow...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-[var(--border-color)] shrink-0 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask FinMech: 'How do I cut down on dining out?'..."
            className="flex-1 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 min-h-[44px]"
            aria-label="Message to FinMech Copilot"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiReplying}
            className="flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-500 disabled:opacity-50 transition-transform duration-150 active:scale-[0.94] min-h-[44px] min-w-[44px]"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
