import { FinancialSummary, AiReport, ChatMessage } from '@/types/finance';

export async function generateFinancialDiagnosis(
  summary: FinancialSummary,
  currency: string = '₹',
  userKey?: string
): Promise<AiReport> {
  const apiKey = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // If API key is available, call Gemini
  if (apiKey) {
    try {
      const prompt = `You are Finmech's elite AI Financial Strategist. Analyze this financial data:
Currency: ${currency}
Total Net Worth: ${summary.totalNetWorth}
Cash in Hand: ${summary.cashInHand}
Bank Balance: ${summary.bankBalance}
Live Business Money: ${summary.businessBalance}
Monthly Income: ${summary.monthlyIncome}
Monthly Expenditure: ${summary.monthlyExpenditure}
Daily Average Spend: ${summary.dailyAverageSpend}
Savings Goal Target: ${summary.savingsGoal.targetAmount}
Current Amount Saved This Month: ${summary.savingsGoal.currentSaved} (${summary.savingsGoal.percentage}%)
Remaining to Save: ${summary.savingsGoal.remaining}
Category Breakdown: ${JSON.stringify(summary.categoryBreakdown)}
Flagged Leaks: ${JSON.stringify(summary.leaks)}

Respond in valid JSON format ONLY with this schema:
{
  "executiveDiagnosis": "2-3 sentences concise diagnosis of current health and spending pace",
  "targetAdvice": "Precise mathematical strategy to hit the savings target of ${currency}${summary.savingsGoal.targetAmount} before month end",
  "techniquesToSave": [
    {
      "id": "tech_1",
      "title": "Short title",
      "category": "Category name",
      "monthlySaving": 1500,
      "actionableStep": "Direct, crisp instruction on what to stop or trim"
    }
  ]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local financial intelligence engine', err);
    }
  }

  // Fallback: Intelligent Heuristic Financial Analysis Engine
  const topSpend = summary.categoryBreakdown[0];
  const target = summary.savingsGoal.targetAmount;
  const currentSaved = summary.savingsGoal.currentSaved;
  const remaining = summary.savingsGoal.remaining;
  const daysLeftInMonth = Math.max(1, 30 - new Date().getDate());
  const maxDailyAllowance = Math.max(0, Math.round((summary.monthlyIncome - target - summary.monthlyExpenditure) / daysLeftInMonth));

  let executiveDiagnosis = '';
  if (summary.savingsGoal.status === 'achieved') {
    executiveDiagnosis = `Outstanding fiscal discipline: you have achieved 100% of your ${currency}${target.toLocaleString()} savings goal! Current net surplus stands at ${currency}${currentSaved.toLocaleString()} across your cash, bank, and business reserves.`;
  } else if (summary.savingsGoal.status === 'on_track') {
    executiveDiagnosis = `Strong financial velocity. You have banked ${currency}${currentSaved.toLocaleString()} (${summary.savingsGoal.percentage}% of target). Your current burn rate of ${currency}${Math.round(summary.dailyAverageSpend).toLocaleString()}/day preserves healthy margin.`;
  } else {
    executiveDiagnosis = `Pacing requires calibration. You need ${currency}${remaining.toLocaleString()} more to reach your ${currency}${target.toLocaleString()} target with ${daysLeftInMonth} days remaining. Current outflows in ${topSpend ? topSpend.category : 'discretionary items'} are exerting pressure on your savings capacity.`;
  }

  let targetAdvice = '';
  if (remaining <= 0) {
    targetAdvice = `Your savings target is fully secured for the month. Allocate remaining surplus directly into low-risk liquid reserves or reinvest in your business capital.`;
  } else {
    targetAdvice = `To guarantee hitting your ${currency}${target.toLocaleString()} target, cap daily personal expenditure to ${currency}${maxDailyAllowance.toLocaleString()}/day for the remaining ${daysLeftInMonth} days. Direct any incoming business revenue draws straight to your savings pocket.`;
  }

  const techniquesToSave = [
    {
      id: 'tech_1',
      title: 'Discretionary Dining Freeze',
      category: 'Food & Dining',
      monthlySaving: Math.round(summary.monthlyExpenditure * 0.12) || 2000,
      actionableStep: 'Switch to a weekly dining allowance. Batch-prep meals 3 days a week to trim 25% of restaurant outings.',
    },
    {
      id: 'tech_2',
      title: 'Digital & Tool Audit',
      category: 'Software & Subscriptions',
      monthlySaving: 1200,
      actionableStep: 'Audit recurring subscriptions and dormant software licenses. Cancel underutilized platforms or switch to annual billing.',
    },
    {
      id: 'tech_3',
      title: 'Strict Cash Envelope System',
      category: 'Cash in Hand',
      monthlySaving: 1500,
      actionableStep: `Keep only ${currency}2,000 cash in hand for spontaneous daily needs. Once physical notes run low, delay non-essential purchases.`,
    },
    {
      id: 'tech_4',
      title: 'Business Profit Skimming (10% Rule)',
      category: 'Live Business',
      monthlySaving: Math.round(summary.businessBalance * 0.1) || 3000,
      actionableStep: 'Whenever you log a business capital milestone, automatically transfer 10% to personal bank savings immediately.',
    },
  ];

  return {
    executiveDiagnosis,
    targetAdvice,
    techniquesToSave,
  };
}

export async function askAiCopilot(
  message: string,
  summary: FinancialSummary,
  currency: string = '₹',
  history: ChatMessage[] = [],
  userKey?: string,
  userName?: string
): Promise<string> {
  const apiKey = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const systemContext = `You are Finmech's personalized AI financial partner.${userName ? ` The user's name is ${userName}. Greet or address them naturally.` : ''}
User Financial State:
- Net Worth: ${currency}${summary.totalNetWorth.toLocaleString()}
- Cash in Hand: ${currency}${summary.cashInHand.toLocaleString()}
- Bank Balance: ${currency}${summary.bankBalance.toLocaleString()}
- Live Business Count: ${currency}${summary.businessBalance.toLocaleString()}
- Monthly Spends: ${currency}${summary.monthlyExpenditure.toLocaleString()}
- Monthly Income: ${currency}${summary.monthlyIncome.toLocaleString()}
- Savings Target: ${currency}${summary.savingsGoal.targetAmount.toLocaleString()} (Progress: ${summary.savingsGoal.percentage}%, Remaining: ${currency}${summary.savingsGoal.remaining.toLocaleString()})
- Daily Burn Rate: ${currency}${Math.round(summary.dailyAverageSpend).toLocaleString()}/day

Answer concisely (max 3-4 sentences), with extreme tactical precision, numerical advice, and encouraging tone.`;

      const contents = [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'model', parts: [{ text: "Understood. I am Finmech Copilot, ready to optimize the user's personal & business finances." }] },
        ...history.slice(-4).map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply;
      }
    } catch (err) {
      console.warn('AI copilot API call failed, falling back to local strategist', err);
    }
  }

  // Local rule-based intelligent responses
  const q = message.toLowerCase();
  const target = summary.savingsGoal.targetAmount;
  const remaining = summary.savingsGoal.remaining;
  const daysLeft = Math.max(1, 30 - new Date().getDate());

  if (q.includes('target') || q.includes('save') || q.includes('goal')) {
    if (remaining <= 0) {
      return `🎉 You've already reached your monthly savings target of ${currency}${target.toLocaleString()}! You have saved ${currency}${summary.savingsGoal.currentSaved.toLocaleString()} so far this month. I recommend parking the excess into a high-yield emergency fund or compounding it into business inventory.`;
    }
    const dailyCap = Math.max(0, Math.round((summary.monthlyIncome - target - summary.monthlyExpenditure) / daysLeft));
    return `To hit your target of ${currency}${target.toLocaleString()}, you need ${currency}${remaining.toLocaleString()} more over the next ${daysLeft} days. Cap your daily discretionary expenditure at ${currency}${dailyCap.toLocaleString()}/day to guarantee hitting 100% on schedule.`;
  }

  if (q.includes('business') || q.includes('capital') || q.includes('company')) {
    return `Your live business balance is ${currency}${summary.businessBalance.toLocaleString()}. You have recorded ${currency}${summary.businessMetrics.totalInflow.toLocaleString()} in revenues. To keep cashflow liquid, keep at least 3 months of recurring operational costs in the business account before transferring dividends to personal savings.`;
  }

  if (q.includes('cash') || q.includes('wallet') || q.includes('pocket')) {
    return `You have ${currency}${summary.cashInHand.toLocaleString()} verified in cash in hand. Cash is best utilized for micro-transactions under ${currency}500 to dodge digital payment friction and prevent impulse swipes.`;
  }

  if (q.includes('cut') || q.includes('spend') || q.includes('reduce') || q.includes('leak')) {
    const top = summary.categoryBreakdown[0];
    if (top) {
      return `Your highest spending category this month is **${top.category}** at ${currency}${top.amount.toLocaleString()} (${top.percentage.toFixed(0)}% of total spends). Cutting just 15% here will unlock ${currency}${Math.round(top.amount * 0.15).toLocaleString()} straight into your savings target.`;
    }
    return `Keep daily spends under ${currency}${Math.round(summary.dailyAverageSpend * 0.85).toLocaleString()} by implementing a 24-hour waiting rule for any non-essential purchase over ${currency}1,000.`;
  }

  return `Currently, your total net worth is ${currency}${summary.totalNetWorth.toLocaleString()} with ${currency}${summary.cashInHand.toLocaleString()} in cash, ${currency}${summary.bankBalance.toLocaleString()} in bank, and ${currency}${summary.businessBalance.toLocaleString()} in live business funds. You are ${summary.savingsGoal.percentage}% toward your savings goal. Ask me how to cut specific categories or hit your savings target faster!`;
}

