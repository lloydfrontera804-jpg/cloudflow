import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/server/db';
import { UserDoc } from '@/lib/server/user-logic';
import { verifyAndConsumeResetToken } from '@/lib/server/reset-token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const email = await verifyAndConsumeResetToken(token);
  if (!email) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired. Request a new one.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const db = await getDb();
  const result = await db
    .collection<UserDoc>('users')
    .updateOne({ email }, { $set: { passwordHash } });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
