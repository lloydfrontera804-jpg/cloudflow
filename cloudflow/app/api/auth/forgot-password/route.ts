import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { UserDoc } from '@/lib/server/user-logic';
import { createResetToken } from '@/lib/server/reset-token';
import { sendPasswordResetEmail } from '@/lib/server/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const user = await db.collection<UserDoc>('users').findOne({ email: normalizedEmail });

    // Always return the same success response whether or not the account
    // exists — confirming/denying an email's existence here would let
    // anyone use this endpoint to check who has an account.
    if (user) {
      const token = await createResetToken(normalizedEmail);
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    return NextResponse.json({ ok: true, message: 'If that email has an account, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot-password failed', err);
    // Still don't leak anything specific to the client on failure.
    return NextResponse.json({ ok: true, message: 'If that email has an account, a reset link has been sent.' });
  }
}
