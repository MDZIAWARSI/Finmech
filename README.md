# Finmech

A fintech app which keeps track of expenditure, live business money, and cash in hand with smart AI suggestions on savings.

## 🚀 Key Features
- **🪙 Cash in Hand**: Real-time physical currency tracking, quick ATM withdrawals, and a physical note denomination counter to catch untracked cash leaks.
- **💼 Live Business Money**: Live operating balance for freelancers and student founders, gross revenue, operating costs, profit margin %, and pending client receivables.
- **💳 Expenditure Analytics**: Categorized spending breakdowns, daily average burn rate, and spending leakage alerts.
- **🤖 AI Savings Copilot**: Powered by Google Gemini 2.5 Flash (with smart offline heuristic fallback). Analyzes your spending to suggest concrete rupee savings.
- **🛡️ Protected API Keys**: User-provided API keys are encrypted in local browser storage only — zero server transmission or leakage.
- **⚡ Fast Data Input**: Natural language text parser (*"spent 120 on auto in cash"*) and quick preset chips for student/founder routines.
- **📱 Progressive Web App (PWA)**: Offline-first architecture, service worker caching, and installable on mobile and desktop.
- **🔑 Free Email Login with OTP**: 6-digit verification code with instant free preview/auto-fill.

## 🛠️ Getting Started

First, install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production
```bash
npm run build
npm start
```
