'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  Send, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { FinancialSummary, AiReport, ChatMessage } from '@/types/finance';
import { generateFinancialDiagnosis, askAiCopilot } from '@/lib/gemini';

interface AiCopilotViewProps {
  summary: FinancialSummary;
  currency?: string;
  onOpenTargetModal: () => void;
}

export function AiCopilotView({
  summary,
  currency = '₹',
  onOpenTargetModal,
}: AiCopilotViewProps) {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content: `Hello Zia! I am your Finmech AI partner. Your current net worth is ${currency}${summary.totalNetWorth.toLocaleString('en-IN')}, and you are ${summary.savingsGoal.percentage}% toward your ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} monthly savings goal. Ask me how to hit your target or cut spending.`,
      timestamp: 'Just now',
    },
  ]);
  const [sendingChat, setSendingChat] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('finmech_gemini_key') || '';
    setApiKey(storedKey);
    fetchReport(storedKey);
  }, []);

  const fetchReport = async (keyToUse?: string) => {
    setLoadingReport(true);
    try {
      const diagnosis = await generateFinancialDiagnosis(summary, currency, keyToUse || apiKey);
      setReport(diagnosis);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('finmech_gemini_key', apiKey.trim());
    setShowKeyInput(false);
    fetchReport(apiKey.trim());
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setSendingChat(true);

    try {
      const response = await askAiCopilot(text, summary, currency, chatMessages, apiKey);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: 'Just now',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const quickPrompts = [
    `How can I hit my ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} target?`,
    'Where is my biggest money leak?',
    'Review my live business balance',
    'Recommend a strict weekly budget',
  ];

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Header with API Key configuration toggle */}
      <section 
        aria-label="AI Copilot overview"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Finmech Intelligence
              </span>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                AI Wealth & Savings Copilot
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Configure Gemini API Key"
              aria-label="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchReport(apiKey)}
              disabled={loadingReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReport ? 'animate-spin' : ''}`} />
              {loadingReport ? 'Analyzing...' : 'Refresh Audit'}
            </button>
          </div>
        </div>

        {/* Optional Custom API Key input */}
        {showKeyInput && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-700 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Custom Gemini API Key (Optional)
              </span>
              <span className="text-neutral-400">Offline intelligence active by default</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-xl"
              >
                Save Key
              </button>
            </div>
          </div>
        )}

        {/* Executive Diagnosis Report */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Executive Financial Diagnosis
          </div>
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            {report?.executiveDiagnosis || 'Running real-time financial diagnostic audit across your income, cash reserves, and monthly expenditure...'}
          </p>
        </div>
      </section>

      {/* Target Achievement Strategy Card */}
      <section 
        aria-label="Target achievement advisor"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Target Achievement Plan
            </h2>
          </div>

          <button
            onClick={onOpenTargetModal}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Change Goal →
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/60 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Monthly Target</span>
            <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
              {currency}{summary.savingsGoal.targetAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Current Saved Pace</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {currency}{summary.savingsGoal.currentSaved.toLocaleString()} ({summary.savingsGoal.percentage}%)
            </span>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
            {report?.targetAdvice || `Cap discretionary spends to hit your ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} target with full certainty before month end.`}
          </p>
        </div>
      </section>

      {/* Suggested Techniques to Save More Money */}
      <section aria-label="Techniques to save" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Techniques to Save More Money
          </h2>
          <span className="text-xs text-neutral-400">
            Tailored to your habits
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(report?.techniquesToSave || []).map((tech) => (
            <div 
              key={tech.id}
              className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {tech.title}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 tabular-nums">
                    +{currency}{tech.monthlySaving.toLocaleString()}/mo
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {tech.actionableStep}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                Category: {tech.category}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive AI Financial Partner Chat */}
      <section 
        aria-label="AI financial chat"
        className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            Chat with Financial Copilot
          </h2>
          <span className="text-[11px] text-neutral-400">Real-time calculations</span>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full text-xs bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar p-1">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-br-xs'
                      : 'bg-neutral-100 dark:bg-[#1c1c21] text-neutral-800 dark:text-neutral-200 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-neutral-400 px-1 mt-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {sendingChat && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span>Finmech Copilot is computing recommendations...</span>
            </div>
          )}
        </div>

        {/* Chat input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative pt-2"
        >
          <input
            type="text"
            placeholder="Ask about your budget, target, or spends..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={sendingChat}
            className="w-full pl-4 pr-12 py-3 bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || sendingChat}
            className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity"
            aria-label="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>
    </div>
  );
}
