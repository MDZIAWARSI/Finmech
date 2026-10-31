import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    console.log(`[FINMECH Free Auth] 🔑 OTP for ${email}: ${code} (Valid for 10 minutes)`);

    // If RESEND_API_KEY or SMTP is configured, send actual email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FINMECH <auth@finmech.app>',
            to: email,
            subject: 'Your FINMECH Login Code',
            html: `<h2>Your FINMECH Login Code is <strong>${code}</strong></h2><p>This code expires in 10 minutes.</p>`,
          }),
        });
      } catch (err) {
        console.warn('Optional Resend dispatch skipped/failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP processed',
      delivery: process.env.RESEND_API_KEY ? 'email' : 'simulated_free',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process OTP' }, { status: 500 });
  }
}

