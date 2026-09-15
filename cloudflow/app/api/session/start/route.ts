import { NextRequest, NextResponse } from 'next/server';
import { getDb, getMongoClient } from '@/lib/server/db';
import { docToSession, getPlanById, newId, SessionDoc, TransactionDoc } from '@/lib/server/session-logic';
import { MachineDoc } from '@/lib/server/machine-logic';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession?.user?.email) {
    return NextResponse.json({ error: 'You must sign in first.' }, { status: 401 });
  }

  const { planId, machineId } = await req.json().catch(() => ({}));
  if (!machineId) return NextResponse.json({ error: 'machineId is required' }, { status: 400 });

  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: 'Unknown planId' }, { status: 400 });

  const db = await getDb();
  const client = await getMongoClient();

  const machine = await db.collection<MachineDoc>('machines').findOne({ _id: machineId });
  if (!machine || machine.status !== 'active') {
    return NextResponse.json({ error: 'This machine is not available.' }, { status: 400 });
  }

  const now = Date.now();
  const existing = await db
    .collection<SessionDoc>('sessions')
    .find({ machineId })
    .sort({ startedAt: -1 })
    .limit(1)
    .next();
  if (existing && existing.expiresAt > now) {
    return NextResponse.json({ error: 'This machine is currently in use by someone else.' }, { status: 409 });
  }

  const sessionId = newId('session');
  const expiresAt = now + plan.durationSeconds * 1000;
  const userEmail = authSession.user.email;
  const userName = authSession.user.name ?? null;

  const sessionDoc: SessionDoc = {
    _id: sessionId,
    machineId,
    planId: plan.id,
    planName: plan.name,
    planPriceInr: plan.priceInr,
    planDurationHours: plan.durationHours,
    status: 'active',
    startedAt: now,
    expiresAt,
    extensionCount: 0,
    ipAddress: null,
    region: null,
    vmName: machine.name,
    updatedAt: now,
    startedByEmail: userEmail,
    startedByName: userName,
    lastActedByEmail: userEmail,
  };

  const txnDoc: TransactionDoc = {
    _id: newId('txn'),
    sessionId,
    machineId,
    kind: 'start',
    planName: plan.name,
    amountInr: plan.priceInr,
    hoursAdded: plan.durationHours,
    createdAt: now,
    userEmail,
    userName,
  };

  const mongoSession = client.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      await db.collection<SessionDoc>('sessions').insertOne(sessionDoc, { session: mongoSession });
      await db.collection<TransactionDoc>('transactions').insertOne(txnDoc, { session: mongoSession });
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }

  return NextResponse.json({ session: docToSession(sessionDoc) });
}
