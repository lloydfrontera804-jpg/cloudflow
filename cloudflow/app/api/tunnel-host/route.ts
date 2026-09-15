import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { MachineDoc } from '@/lib/server/machine-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const machineId = req.nextUrl.searchParams.get('machineId');
  if (!machineId) return NextResponse.json({ error: 'machineId is required' }, { status: 400 });

  try {
    const db = await getDb();
    const machine = await db.collection<MachineDoc>('machines').findOne({ _id: machineId });
    if (!machine) return NextResponse.json({ error: 'Machine not found' }, { status: 404 });

    return NextResponse.json({ host: machine.tunnelHost, updatedAt: machine.tunnelHostUpdatedAt });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load tunnel host' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-tunnel-key');
  if (!key) {
    return NextResponse.json({ error: 'Missing x-tunnel-key header' }, { status: 401 });
  }

  const { host } = await req.json().catch(() => ({}));
  if (!host || typeof host !== 'string') {
    return NextResponse.json({ error: 'host is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    // The key IS the identity here — whichever machine document has this
    // exact tunnelReportKey is the one being updated. No separate machineId
    // needs to be configured on the laptop's script at all.
    const now = Date.now();
    const result = await db.collection<MachineDoc>('machines').findOneAndUpdate(
      { tunnelReportKey: key },
      { $set: { tunnelHost: host, tunnelHostUpdatedAt: now } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Invalid tunnel report key' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, machineId: result._id, machineName: result.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update tunnel host' }, { status: 500 });
  }
}
