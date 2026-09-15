import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/server/db';
import { UserDoc } from '@/lib/server/user-logic';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const normalizedEmail = String(email).toLowerCase().trim();

  if (String(password).length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection<UserDoc>('users').findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists. Try signing in instead.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userDoc: UserDoc = {
    _id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    email: normalizedEmail,
    passwordHash,
    name: name || null,
    createdAt: Date.now(),
  };

  await db.collection<UserDoc>('users').insertOne(userDoc);

  return NextResponse.json({ ok: true });
}
