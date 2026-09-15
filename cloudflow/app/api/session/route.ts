import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { docToSession, SessionDoc } from '@/lib/server/session-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const machineId = req.nextUrl.searchParams.get('machineId');
  if (!machineId) return NextResponse.json({ error: 'machineId is required' }, { status: 400 });

  try {
    const db = await getDb();
    const doc = await db
      .collection<SessionDoc>('sessions')
      .find({ machineId })
      .sort({ startedAt: -1 })
      .limit(1)
      .next();

    if (!doc) return NextResponse.json({ session: null });

    const session = docToSession(doc);

    if (session.status === 'expired' && doc.status !== 'expired') {
      await db
        .collection<SessionDoc>('sessions')
        .updateOne({ _id: doc._id }, { $set: { status: 'expired', updatedAt: Date.now() } });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
