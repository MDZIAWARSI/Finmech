const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generateHandbook() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Color Palette
  const colors = {
    bgDark: [14, 17, 24],        // #0e1118
    cardDark: [22, 25, 34],      // #161922
    cardBorder: [40, 45, 60],    // #282d3c
    accentEmerald: [16, 185, 129], // #10b981
    accentBlue: [59, 130, 246],    // #3b82f6
    accentAmber: [245, 158, 11],   // #f59e0b
    textWhite: [255, 255, 255],
    textMuted: [156, 163, 175],  // #9ca3af
    textDim: [107, 114, 128],    // #6b7280
  };

  function setBg(r, g, b) {
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  function drawCard(x, y, w, h, borderColor = colors.cardBorder) {
    doc.setFillColor(...colors.cardDark);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
  }

  function drawBadge(x, y, text, color) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 22, 5.5, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(text, x + 11, y + 3.8, { align: 'center' });
  }

  // ==========================================
  // PAGE 1: COVER & THE 3 LIQUID POCKETS
  // ==========================================
  setBg(...colors.bgDark);

  // Top header banner
  doc.setFillColor(...colors.cardDark);
  doc.roundedRect(margin, margin, contentWidth, 24, 4, 4, 'F');
  
  // App Title & Version
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...colors.textWhite);
  doc.text('FINMECH v2.0', margin + 6, margin + 11);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.accentEmerald);
  doc.text('OFFICIAL USER MANUAL & MASTER GUIDEBOOK', margin + 6, margin + 18);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textMuted);
  doc.text('Live Capital Tracking • Zero Drift Architecture • Pocket Isolation', margin, margin + 32);

  // SECTION 1: THE CORE ARCHITECTURE
  let curY = margin + 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('1. THE 3 LIQUID ACCOUNTS (POCKETS)', margin, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.textMuted);
  const coreIntro = 'Finmech isolates your capital into 3 distinct liquid pockets so you never accidentally spend business capital on groceries or wonder why your wallet notes do not match your ledger.';
  doc.text(doc.splitTextToSize(coreIntro, contentWidth), margin, curY);

  curY += 12;

  // Pocket Card 1: Bank Account
  drawCard(margin, curY, contentWidth, 34, colors.accentBlue);
  drawBadge(margin + 5, curY + 5, 'BANK', colors.accentBlue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textWhite);
  doc.text('Bank Account (Digital / UPI / Cards)', margin + 32, curY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Represents: Money in your checking/savings bank account, GPay, PhonePe, and debit cards.', margin + 6, curY + 18);
  doc.text('• When to use: When receiving salary, paying rent/bills via UPI, or making online card orders.', margin + 6, curY + 24);
  doc.text('• Quick Deposit: Tap "+ Deposit" directly on the Bank Card on the home dashboard.', margin + 6, curY + 30);

  curY += 38;

  // Pocket Card 2: Cash in Hand
  drawCard(margin, curY, contentWidth, 34, colors.accentEmerald);
  drawBadge(margin + 5, curY + 5, 'CASH', colors.accentEmerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textWhite);
  doc.text('Cash in Hand (Physical Wallet & Coins)', margin + 32, curY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Represents: Real physical paper notes (Rs 500, 200, 100, 50, 20, 10) and loose coins.', margin + 6, curY + 18);
  doc.text('• When to use: When paying for chai, autos, street food, cash tips, or local markets.', margin + 6, curY + 24);
  doc.text('• Physical Audit: Open the Cash Tab to count notes and tap "Apply to Wallet".', margin + 6, curY + 30);

  curY += 38;

  // Pocket Card 3: Live Business
  drawCard(margin, curY, contentWidth, 34, colors.accentAmber);
  drawBadge(margin + 5, curY + 5, 'BIZ', colors.accentAmber);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textWhite);
  doc.text('Live Business (Freelance / Side Ventures)', margin + 32, curY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Represents: Dedicated business treasury for freelancers, creators, and micro-entrepreneurs.', margin + 6, curY + 18);
  doc.text('• When to use: For client payments, project invoices, SaaS tools, domains, and server hosting.', margin + 6, curY + 24);
  doc.text('• Complete Isolation: Business money is STRICTLY excluded from personal savings & spend charts.', margin + 6, curY + 30);

  curY += 42;

  // Core Math Formula Box
  doc.setFillColor(18, 22, 32);
  doc.setDrawColor(...colors.accentEmerald);
  doc.roundedRect(margin, curY, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.accentEmerald);
  doc.text('THE CORE FORMULA FOR TRUTH', margin + 6, curY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textWhite);
  doc.text('Personal Net Balance = Bank Account + Cash in Hand', margin + 6, curY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('Business funds remain in the commercial division until you execute an Owner Draw to Personal Bank.', margin + 6, curY + 21);

  // Footer page 1
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.textDim);
  doc.text('Finmech v2.0 • Page 1 of 3 • Confidential Financial Handbook', margin, pageHeight - 8);

  // ==========================================
  // PAGE 2: LOGGING MONEY & CALENDAR
  // ==========================================
  doc.addPage();
  setBg(...colors.bgDark);

  curY = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('2. HOW TO ENTER & MOVE MONEY (QUICK ENTRY)', margin, curY + 4);

  curY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.textMuted);
  doc.text('Tap the "+" button in the center of the bottom navbar to open Quick Entry. Finmech has 3 clear modes:', margin, curY);

  curY += 8;

  // Grid for Expense, Income, Transfer
  // 1. Expense
  drawCard(margin, curY, contentWidth, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(248, 113, 113); // red
  doc.text('A. Logging an Expense (Money Out)', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('1. Select "Expense" at top. Choose Pay From: Bank, Cash, or Business.', margin + 6, curY + 14);
  doc.text('2. Type the amount on the numeric keypad (e.g. 240).', margin + 6, curY + 20);
  doc.text('3. Pick a category (Food, Transport, Software, Rent) and add an optional note. Tap Done.', margin + 6, curY + 26);

  curY += 34;

  // 2. Income
  drawCard(margin, curY, contentWidth, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.accentEmerald);
  doc.text('B. Logging an Income / Deposit (Money In)', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('1. Select "Income" at top. Choose Deposit Into: Bank, Cash, or Business.', margin + 6, curY + 14);
  doc.text('2. Select Tag: Salary, Client Payment, or Starting Balance / Deposit.', margin + 6, curY + 20);
  doc.text('3. Starting balances never distort your monthly spend charts — they cleanly fund your account.', margin + 6, curY + 26);

  curY += 34;

  // 3. Transfer
  drawCard(margin, curY, contentWidth, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.accentBlue);
  doc.text('C. Moving Money Between Accounts (Transfers)', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Bank -> Cash: An ATM Withdrawal (draws from bank, puts physical notes in wallet).', margin + 6, curY + 15);
  doc.text('• Business -> Bank: An Owner Draw (pays business profit into personal savings).', margin + 6, curY + 21);
  doc.text('• Bank -> Business: Seed Capital (funds your venture from personal savings).', margin + 6, curY + 27);
  doc.text('• Transfers strictly move capital between accounts with zero artificial income inflation.', margin + 6, curY + 33);

  curY += 42;

  // SECTION 3: CALENDAR & SPENDS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('3. CALENDAR & DATE-LEVEL SPEND TRACKING', margin, curY);

  curY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.textMuted);
  doc.text('Finmech features a full interactive calendar so you can see exactly when you spent what:', margin, curY);

  curY += 8;

  drawCard(margin, curY, contentWidth, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.textWhite);
  doc.text('The 7-Column Date Matrix (Overview & Spends tabs)', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Daily Spend Badges: Every day with spending displays an exact pill (e.g. -Rs 250, -Rs 1.2k).', margin + 6, curY + 15);
  doc.text('• 1-Click Drill Down: Tap any date to slide open all transactions spent on that exact date.', margin + 6, curY + 21);
  doc.text('• Monthly Segregation: Use the top month pills (November, October, All Months) to isolate records.', margin + 6, curY + 27);
  doc.text('• Exact Date Search: In Activity Logs, use the native date picker to filter logs to any single day.', margin + 6, curY + 33);
  doc.text('• Edit & Delete: Click any transaction anytime to reassign accounts, fix typos, or delete.', margin + 6, curY + 39);

  // Footer page 2
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.textDim);
  doc.text('Finmech v2.0 • Page 2 of 3 • Confidential Financial Handbook', margin, pageHeight - 8);

  // ==========================================
  // PAGE 3: CASH WALLET, COPILOT & FAQ
  // ==========================================
  doc.addPage();
  setBg(...colors.bgDark);

  curY = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('4. PHYSICAL CASH WALLET & DENOMINATION AUDIT', margin, curY + 4);

  curY += 10;
  drawCard(margin, curY, contentWidth, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.accentEmerald);
  doc.text('Tallying Real Physical Paper Notes', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('1. Open your physical pocket wallet and count your physical Rs 500, 200, 100, 50, 20, 10 notes.', margin + 6, curY + 15);
  doc.text('2. Use the "+" and "-" counters in the Cash Tab to reflect your real notes in hand.', margin + 6, curY + 21);
  doc.text('3. Tap "Apply to Wallet": Finmech reconciles your cash balance to match reality with zero drift.', margin + 6, curY + 27);
  doc.text('4. Reset to 0: If your wallet is empty, tap "Reset to 0" to instantly zero out note counts.', margin + 6, curY + 33);

  curY += 40;

  // SECTION 5: AI COPILOT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('5. AI SAVINGS COPILOT & LEAK DIAGNOSTICS', margin, curY);

  curY += 8;
  drawCard(margin, curY, contentWidth, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.textWhite);
  doc.text('Proactive Financial Intelligence (Gemini 2.5 Flash)', margin + 6, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('• Spending Leak Scanner: Flags any category taking > 20% of your monthly expenditure.', margin + 6, curY + 15);
  doc.text('• Daily Allowance Calculation: Dynamically calculates how much you can spend per day to hit your goal.', margin + 6, curY + 21);
  doc.text('• 1-Click Executive Diagnosis: Tap to generate a full executive health report of your finances.', margin + 6, curY + 27);

  curY += 38;

  // SECTION 6: FAQ & TROUBLESHOOTING
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.textWhite);
  doc.text('6. COMMON QUESTIONS & QUICK CHEAT SHEET', margin, curY);

  curY += 8;

  const faqs = [
    {
      q: 'Q: How do I fund my Bank account for the first time?',
      a: 'Tap "+ Deposit" on the Bank Card on the home dashboard. Type your starting balance and tap Done.',
    },
    {
      q: 'Q: What happens when I withdraw cash from an ATM?',
      a: 'Use Cash Tab -> ATM Refill. Finmech subtracts from Bank and adds physical Rs 500 notes to Cash.',
    },
    {
      q: 'Q: What if I made a mistake or want to delete a transaction?',
      a: 'Tap the transaction in Recent Movements. You can edit the amount, change account, or tap Delete.',
    },
    {
      q: 'Q: What if I want to wipe everything and start completely fresh?',
      a: 'Click your profile avatar in the top navbar -> click "Clear Every Data & Fresh Reset".',
    },
  ];

  faqs.forEach((faq) => {
    drawCard(margin, curY, contentWidth, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.textWhite);
    doc.text(faq.q, margin + 5, curY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text(faq.a, margin + 5, curY + 13);
    curY += 21;
  });

  // Footer page 3
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.textDim);
  doc.text('Finmech v2.0 • Page 3 of 3 • Generated for Authenticated Finmech Vault', margin, pageHeight - 8);

  const outPath = path.join(__dirname, '../public/finmech_user_guide.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully generated Finmech User Guide PDF at:', outPath);
}

generateHandbook();
