'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Key,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Send,
  Bot,
  User,
  Copy,
  Check,
  FileText,
  RotateCw,
  ArrowRight,
  DollarSign,
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

  // Load audit on mount or when transactions change
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
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0d1322] to-indigo-950/50 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                FINMECH AI Financial Copilot
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Where You Spend More & How to Fix It
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Continuous analysis of your expenditure, physical pocket cash, and live business cashflow with tailored fixes.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-semibold border transition-all ${
                apiKeyConfig.isValidated
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/50'
              }`}
            >
              {apiKeyConfig.isValidated ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Gemini 2.5 Flash Connected</span>
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 text-amber-400" />
                  <span>Free AI Mode (Add Your Key)</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-400">
              Keys are encrypted locally and never transmitted to our servers.
            </span>
          </div>
        </div>

        {/* Executive Summary Snippet */}
        <div className="mt-6 pt-5 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              AI Diagnostic Verdict:
            </p>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isLoadingAudit ? 'Analyzing spending patterns...' : executiveReport}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-2.5 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-slate-400 block">Identified Monthly Savings</span>
              <span className="text-lg font-black text-emerald-400">
                +₹{totalPotentialSavings.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <button
              onClick={runAudit}
              disabled={isLoadingAudit}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              title="Re-run AI Analysis"
            >
              <RotateCw className={`h-4 w-4 ${isLoadingAudit ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Fixes Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200">
              Targeted Spending Leaks & Actionable Fixes
            </h2>
          </div>
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            {copiedReport ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((sug) => {
            const isHigh = sug.severity === 'high';
            return (
              <div
                key={sug.id}
                className="rounded-3xl bg-[#0d1322] border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {sug.category}
                    </span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Save ₹{sug.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mt-2.5">{sug.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {sug.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/60 -mx-5 -mb-5 p-4 rounded-b-3xl">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide">
                        How to fix this:
                      </p>
                      <p className="text-xs text-slate-200 mt-0.5 leading-snug">
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

      {/* Interactive AI Chat Section */}
      <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 shadow-xl flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-slate-950 font-bold">
              <Bot className="h-4 w-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">FinMech AI Copilot Chat</h3>
              <p className="text-[11px] text-slate-400">Ask about your budget, purchases, or business</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Live Context Synced
          </span>
        </div>

        {/* Quick Question Pills */}
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800/50">
          {[
            'Where am I spending more this month?',
            'Can I afford a ₹3,000 purchase today?',
            'How can I boost my business margin?',
            'Give me a 30-day student savings plan',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 border border-slate-700/80 hover:border-emerald-500/50 hover:text-emerald-300 whitespace-nowrap transition-all shrink-0"
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
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className="block text-[9px] text-slate-400 mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isAiReplying && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
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
          className="pt-3 border-t border-slate-800 shrink-0 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask FinMech: 'How do I cut down on dining out?'..."
            className="flex-1 rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiReplying}
            className="flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
