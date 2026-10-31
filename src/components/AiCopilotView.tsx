'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Lightbulb, 
  Send, 
  RefreshCw, 
  Key, 
  Bot,
  X
} from 'lucide-react';
import { FinancialSummary, AiReport, ChatMessage } from '@/types/finance';
import { generateFinancialDiagnosis, askAiCopilot } from '@/lib/gemini';

interface AiCopilotViewProps {
  summary: FinancialSummary;
  currency?: string;
  userName?: string;
  onOpenTargetModal: () => void;
  onClose?: () => void;
}

export function AiCopilotView({
  summary,
  currency = '₹',
  userName,
  onOpenTargetModal,
  onClose,
}: AiCopilotViewProps) {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const firstName = userName ? userName.split(' ')[0] : '';
  const initialGreeting = firstName ? `Hello ${firstName}!` : 'Hello!';

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content: `${initialGreeting} I am your Finmech AI copilot. Your net worth is ${currency}${summary.totalNetWorth.toLocaleString('en-IN')}, and you are ${summary.savingsGoal.percentage}% toward your ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} savings target. Ask me how to hit your goal or optimize spending.`,
      timestamp: 'Just now',
    },
  ]);
  const [sendingChat, setSendingChat] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Dynamically update greeting when user signs in
  useEffect(() => {
    if (userName) {
      const first = userName.split(' ')[0];
      setChatMessages((prev) => {
        if (prev.length > 0 && prev[0].id === 'msg_init') {
          return [
            {
              ...prev[0],
              content: `Hello ${first}! I am your Finmech AI copilot. Your net worth is ${currency}${summary.totalNetWorth.toLocaleString('en-IN')}, and you are ${summary.savingsGoal.percentage}% toward your ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} savings target. Ask me how to hit your goal or optimize spending.`,
            },
            ...prev.slice(1),
          ];
        }
        return prev;
      });
    }
  }, [userName, currency, summary.totalNetWorth, summary.savingsGoal.percentage, summary.savingsGoal.targetAmount]);

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
      const response = await askAiCopilot(text, summary, currency, chatMessages, apiKey, userName);
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
    <div className="space-y-8 pb-32 pt-2">
      {/* Header Overview (Clean & Open) */}
      <section aria-label="AI Copilot overview" className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Finmech Intelligence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
              {loadingReport ? 'Auditing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Big Typography Header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-2">
          AI Wealth Strategist
        </h1>

        {/* Optional Custom API Key input */}
        {showKeyInput && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#141417] space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Gemini API Key (Optional)
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
                Save
              </button>
            </div>
          </div>
        )}

        {/* Executive Diagnosis Statement */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
          <p className="text-base sm:text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
            {report?.executiveDiagnosis || 'Running real-time financial diagnostic audit across your income, cash reserves, and monthly expenditure...'}
          </p>
        </div>
      </section>

      {/* Target Achievement Plan (Fluid & Open) */}
      <section aria-label="Target achievement advisor" className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            Target Achievement Plan
          </h2>
          <button
            onClick={onOpenTargetModal}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Adjust Target →
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-100/60 dark:bg-[#141417] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-500">Goal Target</span>
            <span className="text-neutral-900 dark:text-white tabular-nums">
              {currency}{summary.savingsGoal.targetAmount.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.savingsGoal.percentage)}%` }}
            />
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
            {report?.targetAdvice || `Cap discretionary spends to hit your ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} target with full certainty before month end.`}
          </p>
        </div>
      </section>

      {/* Actionable Techniques to Save More Money */}
      <section aria-label="Techniques to save" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Techniques to Save More Money
          </h2>
          <span className="text-xs text-neutral-400 font-medium">
            Calculated for you
          </span>
        </div>

        <div className="space-y-3">
          {(report?.techniquesToSave || []).map((tech) => (
            <div 
              key={tech.id}
              className="p-4 rounded-2xl bg-neutral-100/60 dark:bg-[#141417] space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 dark:text-white">
                  {tech.title}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{currency}{tech.monthlySaving.toLocaleString()}/mo
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {tech.actionableStep}
              </p>
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest pt-1">
                {tech.category}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive AI Financial Partner Chat */}
      <section aria-label="AI financial chat" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Financial Copilot Chat
          </h2>
          <span className="text-[11px] text-neutral-400">Live intelligence</span>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-[#141417] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat message stream */}
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
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-[#141417] text-neutral-800 dark:text-neutral-200'
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
              <Bot className="w-3.5 h-3.5 animate-pulse text-indigo-500 dark:text-indigo-400" />
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
            className="w-full pl-4 pr-12 py-3 bg-neutral-100/70 dark:bg-[#141417] rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || sendingChat}
            className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 w-8 h-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:opacity-40 flex items-center justify-center shadow-xs transition-colors"
            aria-label="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>
    </div>
  );
}
