import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { MachineDoc, isAdminEmail, newMachineId, newTunnelReportKey } from '@/lib/server/machine-logic';
import { SessionDoc } from '@/lib/server/session-logic';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authSession = await auth();
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const db = await getDb();
    const machines = await db.collection<MachineDoc>('machines').find().sort({ createdAt: 1 }).toArray();

    // For each machine, check whether it currently has a live (non-expired)
    // session, so the UI can show "in use" vs "available" without a second
    // round trip per machine.
    const now = Date.now();
    const result = await Promise.all(
      machines.map(async (m) => {
        const latestSession = await db
          .collection<SessionDoc>('sessions')
          .find({ machineId: m._id })
          .sort({ startedAt: -1 })
          .limit(1)
          .next();
        const inUse = !!latestSession && latestSession.expiresAt > now;

        return {
          id: m._id,
          name: m.name,
          status: m.status,
          hasTunnelHost: !!m.tunnelHost,
          inUse,
          // tunnelReportKey deliberately NOT included here — that's a
          // secret the laptop needs, not something every signed-in
          // classmate's browser should ever see.
        };
      })
    );

    return NextResponse.json({
      machines: result,
      isAdmin: isAdminEmail(authSession.user.email),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load machines' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession?.user?.email || !isAdminEmail(authSession.user.email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { name } = await req.json().catch(() => ({}));
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'A machine name is required' }, { status: 400 });
  }

  const db = await getDb();
  const tunnelReportKey = newTunnelReportKey();
  const machineDoc: MachineDoc = {
    _id: newMachineId(),
    name: name.trim(),
    status: 'active',
    tunnelHost: null,
    tunnelHostUpdatedAt: null,
    tunnelReportKey,
    createdAt: Date.now(),
    createdByEmail: authSession.user.email,
  };

  await db.collection<MachineDoc>('machines').insertOne(machineDoc);

  // The report key is only ever shown ONCE, right here, at creation time —
  // it's not retrievable again through the API afterward (same principle as
  // a cloud provider showing you an API key exactly once). If it's lost,
  // the fix is deleting the machine and creating a new one, not
  // "retrieving" the old key.
  return NextResponse.json({
    machine: { id: machineDoc._id, name: machineDoc.name, status: machineDoc.status },
    tunnelReportKey,
  });
}
