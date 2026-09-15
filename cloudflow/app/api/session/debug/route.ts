import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { docToSession, SessionDoc } from '@/lib/server/session-logic';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug controls are disabled in production' }, { status: 403 });
  }

  const { action, machineId } = await req.json().catch(() => ({}));
  if (!machineId) return NextResponse.json({ error: 'machineId is required' }, { status: 400 });

  const db = await getDb();
  const current = await db
    .collection<SessionDoc>('sessions')
    .find({ machineId })
    .sort({ startedAt: -1 })
    .limit(1)
    .next();
  if (!current) return NextResponse.json({ error: 'No session to modify' }, { status: 400 });

  const now = Date.now();

  if (action === 'reset') {
    await db.collection<SessionDoc>('sessions').deleteOne({ _id: current._id });
    return NextResponse.json({ session: null });
  }

  let newExpiresAt = current.expiresAt;
  if (action === 'warning') {
    newExpiresAt = now + 295 * 1000;
  } else if (action === 'expire') {
    newExpiresAt = now;
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const updated = await db
    .collection<SessionDoc>('sessions')
    .findOneAndUpdate(
      { _id: current._id },
      { $set: { expiresAt: newExpiresAt, updatedAt: now } },
      { returnDocument: 'after' }
    );

  return NextResponse.json({ session: updated ? docToSession(updated) : null });
}
