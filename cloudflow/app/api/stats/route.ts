import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { TransactionDoc } from '@/lib/server/session-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')?.toLowerCase();
    const db = await getDb();

    // With email: this classmate's own usage. Without: everyone's combined
    // (kept for admin/debug visibility — not shown to individual users in
    // the UI once accounts are wired up).
    const sessionMatch = email ? { startedByEmail: email } : {};
    const txnMatch = email ? { userEmail: email } : {};

    const sessionsCount = await db.collection('sessions').countDocuments(sessionMatch);
    const agg = await db
      .collection<TransactionDoc>('transactions')
      .aggregate([
        { $match: txnMatch },
        {
          $group: {
            _id: null,
            spent: { $sum: '$amountInr' },
            hours: { $sum: '$hoursAdded' },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      totalSessionsCompleted: sessionsCount,
      totalSpentInr: agg[0]?.spent ?? 0,
      totalHoursUsed: agg[0]?.hours ?? 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
