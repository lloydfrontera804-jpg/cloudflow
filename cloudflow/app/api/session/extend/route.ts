import { NextRequest, NextResponse } from 'next/server';
import { getDb, getMongoClient } from '@/lib/server/db';
import { docToSession, getPlanById, newId, SessionDoc, TransactionDoc } from '@/lib/server/session-logic';
import { PRICING_PLANS } from '@/config/vm-service';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession?.user?.email) {
    return NextResponse.json({ error: 'You must sign in first.' }, { status: 401 });
  }
  const userEmail = authSession.user.email;
  const userName = authSession.user.name ?? null;

  const { planId, machineId } = await req.json().catch(() => ({}));
  if (!machineId) return NextResponse.json({ error: 'machineId is required' }, { status: 400 });
  const plan = getPlanById(planId) || PRICING_PLANS[0];

  const db = await getDb();
  const client = await getMongoClient();
  const mongoSession = client.startSession();

  try {
    const current = await db
      .collection<SessionDoc>('sessions')
      .find({ machineId })
      .sort({ startedAt: -1 })
      .limit(1)
      .next();

    if (!current) {
      return NextResponse.json({ error: 'No active session on this machine to extend.' }, { status: 400 });
    }

    const now = Date.now();
    const currentRemaining = current.expiresAt - now;
    const addedMs = plan.durationSeconds * 1000;
    const newExpiresAt = currentRemaining <= 0 ? now + addedMs : current.expiresAt + addedMs;
    const newExtensionCount = current.extensionCount + 1;

    const txnDoc: TransactionDoc = {
      _id: newId('txn'),
      sessionId: current._id,
      machineId,
      kind: 'extend',
      planName: plan.name,
      amountInr: plan.priceInr,
      hoursAdded: plan.durationHours,
      createdAt: now,
      userEmail,
      userName,
    };

    let updated: SessionDoc | null = null;
    await mongoSession.withTransaction(async () => {
      updated = await db.collection<SessionDoc>('sessions').findOneAndUpdate(
        { _id: current._id },
        {
          $set: {
            planId: plan.id,
            planName: plan.name,
            planPriceInr: plan.priceInr,
            planDurationHours: plan.durationHours,
            expiresAt: newExpiresAt,
            extensionCount: newExtensionCount,
            status: 'extended',
            updatedAt: now,
            lastActedByEmail: userEmail,
          },
        },
        { returnDocument: 'after', session: mongoSession }
      );
      await db.collection<TransactionDoc>('transactions').insertOne(txnDoc, { session: mongoSession });
    });

    if (!updated) return NextResponse.json({ error: 'Failed to extend session' }, { status: 500 });
    return NextResponse.json({ session: docToSession(updated) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to extend session' }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }
}
