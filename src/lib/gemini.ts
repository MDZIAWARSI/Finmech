import { FinancialSummary } from './financeCalculations';
import { Transaction, AiSavingSuggestion } from '../types/finance';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

export const GeminiService = {
  // Verify API Key with a lightweight ping
  async verifyApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    if (!apiKey || apiKey.trim().length < 15) {
      return { valid: false, error: 'Key looks too short or empty' };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test. Reply with "OK".' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          valid: false,
          error: errData?.error?.message || `HTTP ${res.status}: Verification failed`,
        };
      }

      return { valid: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error connecting to Gemini API';
      return { valid: false, error: message };
    }
  },

  // Parse natural language input into structured transaction
  async parseNaturalTransaction(
    text: string,
    apiKey?: string
  ): Promise<{
    type: 'expense' | 'income' | 'transfer';
    amount: number;
    category: string;
    pocket: 'cash' | 'bank' | 'business';
    note: string;
  } | null> {
    const fallbackParse = () => {
      const lower = text.toLowerCase();
      // Extract amount
      const amountMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 100;

      // Determine pocket
      let pocket: 'cash' | 'bank' | 'business' = 'bank';
      if (lower.includes('cash') || lower.includes('pocket') || lower.includes('atm')) pocket = 'cash';
      else if (lower.includes('client') || lower.includes('business') || lower.includes('freelance') || lower.includes('invoice') || lower.includes('gig')) pocket = 'business';

      // Determine type
      let type: 'expense' | 'income' | 'transfer' = 'expense';
      if (lower.includes('received') || lower.includes('got') || lower.includes('earned') || lower.includes('salary') || lower.includes('income')) {
        type = 'income';
      }

      // Determine category
      let category = 'Others';
      if (lower.includes('chai') || lower.includes('coffee') || lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('canteen')) category = 'Food & Dining';
      else if (lower.includes('auto') || lower.includes('cab') || lower.includes('uber') || lower.includes('metro') || lower.includes('bus') || lower.includes('petrol')) category = 'Commute & Travel';
      else if (lower.includes('book') || lower.includes('xerox') || lower.includes('stationery') || lower.includes('exam') || lower.includes('tuition')) category = 'Education & Xerox';
      else if (lower.includes('sub') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('prime')) category = 'Subscriptions';
      else if (lower.includes('client') || lower.includes('project') || lower.includes('gig')) category = 'Client Project';

      return {
        type,
        amount,
        category,
        pocket,
        note: text.trim(),
      };
    };

    if (!apiKey) return fallbackParse();

    try {
      const prompt = `You are a financial entity extractor for an app called FINMECH.
Given the user's sentence: "${text}"
Extract the transaction details into STRICT JSON format with keys:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (positive),
  "category": string (e.g. "Food & Dining", "Commute & Travel", "Education & Xerox", "Shopping", "Client Project", "Software & Tools", "Entertainment"),
  "pocket": "cash" | "bank" | "business",
  "note": string
}
Return ONLY valid raw JSON with NO markdown code blocks.`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      });

      if (!res.ok) return fallbackParse();
      const data: GeminiResponse = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        type: parsed.type || 'expense',
        amount: Number(parsed.amount) || 50,
        category: parsed.category || 'Food & Dining',
        pocket: parsed.pocket || 'cash',
        note: parsed.note || text,
      };
    } catch {
      return fallbackParse();
    }
  },

  // Generate Savings Suggestions & Leaks
  async generateSavingsAudit(
    summary: FinancialSummary,
    transactions: Transaction[],
    apiKey?: string
  ): Promise<{ suggestions: AiSavingSuggestion[]; summaryReport: string }> {
    // Built-in intelligent heuristic engine (guarantees instantaneous response even with no API key)
    const topCategories = summary.categoryBreakdown;
    const heuristics: AiSavingSuggestion[] = [];

    // Food & Dining leak
    const foodCat = topCategories.find((c) => c.category.toLowerCase().includes('food'));
    if (foodCat && foodCat.amount > 1500) {
      heuristics.push({
        id: 'sug_food',
        category: 'Food & Dining',
        severity: foodCat.percentage > 30 ? 'high' : 'medium',
        title: 'Canteen & Food Delivery Leak',
        description: `You've spent ₹${foodCat.amount.toLocaleString('en-IN')} (${foodCat.percentage}% of your monthly expenses) across ${foodCat.count} orders. Ordering takeout adds up quickly compared to campus meal plans.`,
        potentialMonthlySavings: Math.round(foodCat.amount * 0.35),
        actionableStep: 'Switch 3 takeout dinners per week to mess/hostel meals, or buy monthly canteen meal tokens at 20% discount.',
      });
    }

    // Cash in Hand Untracked Leaks
    if (summary.cashInHand < 500) {
      heuristics.push({
        id: 'sug_cash',
        category: 'Cash in Hand',
        severity: 'high',
        title: 'Low Cash Buffer Warning',
        description: `Your cash in hand is currently ₹${summary.cashInHand}. Maintaining a ₹1,000 to ₹2,000 emergency cash buffer prevents ATM rush fees and UPI server downtime glitches.`,
        potentialMonthlySavings: 250,
        actionableStep: 'Withdraw ₹1,500 from ATM once per fortnight and log small cash spends immediately in FINMECH.',
      });
    }

    // Subscriptions check
    const subCat = topCategories.find((c) => c.category.toLowerCase().includes('sub'));
    if (subCat && subCat.amount > 400) {
      heuristics.push({
        id: 'sug_subs',
        category: 'Subscriptions',
        severity: 'medium',
        title: 'Subscription Optimization',
        description: `You are spending ₹${subCat.amount.toLocaleString('en-IN')}/month on entertainment or software services.`,
        potentialMonthlySavings: Math.round(subCat.amount * 0.5),
        actionableStep: 'Verify student ID discounts (Spotify Student is ₹59/mo, GitHub Student Developer Pack gives free software).',
      });
    }

    // Business profit margins
    if (summary.businessMetrics.grossRevenue > 0 && summary.businessMetrics.profitMargin < 60) {
      heuristics.push({
        id: 'sug_biz',
        category: 'Business & Freelance',
        severity: 'medium',
        title: 'Increase Side-Hustle Margin',
        description: `Your business profit margin is ${summary.businessMetrics.profitMargin}%. Operating expenses are taking a large chunk of your freelance/gig earnings.`,
        potentialMonthlySavings: Math.round(summary.businessMetrics.operatingExpenses * 0.4),
        actionableStep: 'Audit software subscriptions, renegotiate hosting/tool tiers, and request 50% upfront deposits on client milestones.',
      });
    }

    // If API key is present, get personalized deep insights from Gemini
    if (apiKey && apiKey.trim().length > 15) {
      try {
        const payloadPrompt = `You are FINMECH AI, an elite financial strategist and savings copilot for college students, young founders, and micro-entrepreneurs.
Financial Summary:
- Cash in Hand: ₹${summary.cashInHand}
- Bank/Digital Balance: ₹${summary.bankBalance}
- Live Business Money: ₹${summary.businessBalance} (Gross: ₹${summary.businessMetrics.grossRevenue}, OpEx: ₹${summary.businessMetrics.operatingExpenses}, Profit Margin: ${summary.businessMetrics.profitMargin}%)
- Monthly Total Expenditure: ₹${summary.monthlyExpenditure}
- Daily Average Spend: ₹${summary.dailyAverageSpend}
- Category Expenses: ${JSON.stringify(summary.categoryBreakdown.slice(0, 6))}
- Recent 8 Transactions: ${JSON.stringify(transactions.slice(0, 8).map(t => ({ cat: t.category, amt: t.amount, pocket: t.pocket, note: t.note })))}

Generate a personalized spending audit and savings plan in STRICT JSON format:
{
  "summaryReport": "A concise 2-3 sentence executive diagnosis of their financial health, highlighting where money leaks and greatest opportunity for savings.",
  "suggestions": [
    {
      "id": "sug_1",
      "category": "Category name",
      "severity": "high" | "medium" | "tip",
      "title": "Punchy title of leak/tip",
      "description": "Clear explanation referencing their specific numbers",
      "potentialMonthlySavings": number,
      "actionableStep": "Specific action they can take today"
    }
  ]
}
Return ONLY valid JSON with no markdown wrapping.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: payloadPrompt }] }],
            generationConfig: { temperature: 0.2 },
          }),
        });

        if (res.ok) {
          const geminiData: GeminiResponse = await res.json();
          const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return {
              suggestions: parsed.suggestions,
              summaryReport: parsed.summaryReport || 'Financial analysis generated with Gemini 2.5 Flash.',
            };
          }
        }
      } catch (e) {
        console.warn('Gemini AI API call failed, falling back to smart heuristics:', e);
      }
    }

    const defaultReport = `Your net liquidity is ₹${summary.totalNetWorth.toLocaleString('en-IN')}. Top spending category is ${topCategories[0]?.category || 'Daily Spends'} at ${topCategories[0]?.percentage || 0}% of total outgoings. By curbing impulsive dining and taking advantage of student discounts, you can easily retain ₹${heuristics.reduce((acc, h) => acc + h.potentialMonthlySavings, 0).toLocaleString('en-IN')} extra each month.`;

    return {
      suggestions: heuristics,
      summaryReport: defaultReport,
    };
  },

  // Interactive FinMech Copilot Chat
  async askFinancialCopilot(
    userMessage: string,
    summary: FinancialSummary,
    transactions: Transaction[],
    chatHistory: { role: string; content: string }[],
    apiKey?: string
  ): Promise<string> {
    if (apiKey && apiKey.trim().length > 15) {
      try {
        const systemContext = `You are FINMECH AI, a smart, friendly, and street-smart financial copilot for an ambitious student / early-stage business founder.
Current Live Context:
- Cash in Hand: ₹${summary.cashInHand.toLocaleString('en-IN')}
- Bank Account: ₹${summary.bankBalance.toLocaleString('en-IN')}
- Live Business Money: ₹${summary.businessBalance.toLocaleString('en-IN')} (Profit Margin: ${summary.businessMetrics.profitMargin}%)
- Total Net Worth: ₹${summary.totalNetWorth.toLocaleString('en-IN')}
- Total Spent This Month: ₹${summary.monthlyExpenditure.toLocaleString('en-IN')}
- Daily Average Spend: ₹${summary.dailyAverageSpend.toLocaleString('en-IN')}
- Top Expenses: ${summary.categoryBreakdown.slice(0, 4).map(c => `${c.category}: ₹${c.amount} (${c.percentage}%)`).join(', ')}

Guidelines:
1. Provide actionable, concise, empathetic financial advice.
2. Directly refer to their exact numbers (cash in hand, business revenue, food burn).
3. If asked about buying something, calculate how many days of income/allowance it takes, or impact on their cash in hand.
4. Keep answers under 120 words unless they ask for a detailed step-by-step plan.`;

        const messagesPayload = [
          { role: 'user', parts: [{ text: `${systemContext}\n\nUser Question: ${userMessage}` }] },
        ];

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messagesPayload,
            generationConfig: { temperature: 0.3 },
          }),
        });

        if (res.ok) {
          const geminiData: GeminiResponse = await res.json();
          const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return reply.trim();
        }
      } catch (err) {
        console.warn('Gemini chat error:', err);
      }
    }

    // Heuristic Smart Responses
    const lower = userMessage.toLowerCase();
    if (lower.includes('afford') || lower.includes('buy') || lower.includes('purchase')) {
      return `With ₹${summary.cashInHand.toLocaleString('en-IN')} in physical cash and ₹${summary.bankBalance.toLocaleString('en-IN')} in your bank, you have ₹${(summary.cashInHand + summary.bankBalance).toLocaleString('en-IN')} personal liquidity. Make sure this purchase doesn't dip below your ₹3,000 emergency buffer. If it's for your business, you have ₹${summary.businessBalance.toLocaleString('en-IN')} in business reserves!`;
    }
    if (lower.includes('leak') || lower.includes('spending more') || lower.includes('where is my money')) {
      const top = summary.categoryBreakdown[0];
      return `Your primary spending leakage is in **${top?.category || 'Food & Dining'}**, taking ₹${top?.amount?.toLocaleString('en-IN')} (${top?.percentage}% of all expenditures this month). In addition, your daily average burn is ₹${summary.dailyAverageSpend}. Setting a daily limit of ₹${Math.max(100, Math.round(summary.dailyAverageSpend * 0.75))} will save you ₹${Math.round(summary.dailyAverageSpend * 0.25 * 30).toLocaleString('en-IN')} over 30 days!`;
    }
    if (lower.includes('save') || lower.includes('tips') || lower.includes('goal')) {
      return `Here are 3 fast savings tactics tailored to your current spend:
1. **The 3-Day Rule**: Wait 72 hours before any non-essential purchase over ₹500.
2. **Cash Envelope**: Keep exactly ₹1,000 cash for weekly street food/canteen, and don't replenish until Monday.
3. **Business Reinvestment**: Transfer 40% of freelance revenue (₹${Math.round(summary.businessMetrics.grossRevenue * 0.4).toLocaleString('en-IN')}) straight to personal savings as owner salary!`;
    }
    if (lower.includes('business') || lower.includes('client') || lower.includes('freelance')) {
      return `Your Live Business Money stands at **₹${summary.businessBalance.toLocaleString('en-IN')}** with a healthy **${summary.businessMetrics.profitMargin}% profit margin**. You have ₹${summary.businessMetrics.pendingReceivables.toLocaleString('en-IN')} in pending client invoices. Tip: Collect a 50% advance before kickoff to keep cashflow green!`;
    }

    return `FinMech Analysis: Your net liquidity is ₹${summary.totalNetWorth.toLocaleString('en-IN')}. You've spent ₹${summary.monthlyExpenditure.toLocaleString('en-IN')} this month. To optimize your finances, focus on keeping your daily burn below ₹${summary.dailyAverageSpend} and logging every cash spend immediately. Feel free to ask me to analyze a specific budget or evaluate a big purchase!`;
  },
};

