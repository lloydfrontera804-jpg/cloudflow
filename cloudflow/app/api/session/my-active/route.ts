import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { docToSession, SessionDoc } from '@/lib/server/session-logic';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// Looks across ALL machines for a live (non-expired) session started by the
// currently signed-in user, so a closed tab / refresh / different device
// can resume exactly where they left off instead of landing back on the
// machine picker with no way back into their own running session.
export async function GET() {
  const authSession = await auth();
  if (!authSession?.user?.email) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const now = Date.now();

    // If the same person somehow has more than one live session across
    // different machines (nothing currently prevents that — a real gap
    // worth knowing about separately from this fix), resume the most
    // recently started one rather than erroring or picking arbitrarily.
    const doc = await db
      .collection<SessionDoc>('sessions')
      .find({ startedByEmail: authSession.user.email, expiresAt: { $gt: now } })
      .sort({ startedAt: -1 })
      .limit(1)
      .next();

    if (!doc) return NextResponse.json({ machineId: null });

    return NextResponse.json({ machineId: doc.machineId, session: docToSession(doc) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to check for an active session' }, { status: 500 });
  }
}
