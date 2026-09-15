import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { TransactionDoc } from '@/lib/server/session-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')?.toLowerCase();
    const db = await getDb();
    const match = email ? { userEmail: email } : {};

    const docs = await db
      .collection<TransactionDoc>('transactions')
      .find(match)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      transactions: docs.map((t) => ({
        id: t._id,
        date: new Date(t.createdAt).toLocaleString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short',
        }),
        description: `${t.planName} (${t.hoursAdded} Hours)`,
        amountInr: t.amountInr,
        hoursAdded: t.hoursAdded,
        paymentMethod: 'UPI / NetBanking (not yet a real gateway)',
        status: 'completed',
        invoiceNumber: 'INV-' + t._id.slice(-8).toUpperCase(),
        userEmail: t.userEmail,
        userName: t.userName,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 });
  }
}
