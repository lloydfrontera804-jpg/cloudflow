import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { MachineDoc, isAdminEmail } from '@/lib/server/machine-logic';
import { SessionDoc } from '@/lib/server/session-logic';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ machineId: string }> }) {
  const authSession = await auth();
  if (!authSession?.user?.email || !isAdminEmail(authSession.user.email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { machineId } = await params;
  const { name, status } = await req.json().catch(() => ({}));

  const update: Partial<Pick<MachineDoc, 'name' | 'status'>> = {};
  if (typeof name === 'string' && name.trim()) update.name = name.trim();
  if (status === 'active' || status === 'disabled') update.status = status;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection<MachineDoc>('machines').findOneAndUpdate(
    { _id: machineId },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result) return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
  return NextResponse.json({ machine: { id: result._id, name: result.name, status: result.status } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ machineId: string }> }) {
  const authSession = await auth();
  if (!authSession?.user?.email || !isAdminEmail(authSession.user.email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { machineId } = await params;
  const db = await getDb();

  // Refuse to delete a machine mid-rental — force the admin to let the
  // session expire (or manually expire it) first, so nobody's active
  // countdown just vanishes out from under them.
  const now = Date.now();
  const liveSession = await db
    .collection<SessionDoc>('sessions')
    .find({ machineId })
    .sort({ startedAt: -1 })
    .limit(1)
    .next();
  if (liveSession && liveSession.expiresAt > now) {
    return NextResponse.json(
      { error: 'This machine has an active session. Wait for it to expire before deleting.' },
      { status: 409 }
    );
  }

  const result = await db.collection<MachineDoc>('machines').deleteOne({ _id: machineId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
