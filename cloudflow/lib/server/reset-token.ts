import crypto from 'crypto';
import { getDb } from './db';

export interface ResetTokenDoc {
  _id: string; // sha256 hash of the plaintext token — never store the plaintext itself
  email: string;
  expiresAt: Date; // Date, not a ms number, so Mongo's TTL index can auto-delete it
  used: boolean;
  createdAt: number;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Returns the PLAINTEXT token (only ever held in memory here, put into the
// emailed link, and never persisted) — the DB only ever stores its hash.
export async function createResetToken(email: string): Promise<string> {
  const plaintextToken = crypto.randomBytes(32).toString('hex');
  const db = await getDb();

  await db.collection<ResetTokenDoc>('passwordResetTokens').insertOne({
    _id: hashToken(plaintextToken),
    email: email.toLowerCase(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    used: false,
    createdAt: Date.now(),
  });

  return plaintextToken;
}

// Verifies a token is real, unused, and unexpired; marks it used; returns
// the associated email, or null if the token is invalid for any reason.
// Deliberately vague about WHY it failed (expired vs. already used vs.
// never existed) — that distinction isn't useful to whoever's holding an
// invalid link, and could help someone probe for valid-but-expired tokens.
export async function verifyAndConsumeResetToken(token: string): Promise<string | null> {
  const db = await getDb();
  const hashed = hashToken(token);

  const doc = await db.collection<ResetTokenDoc>('passwordResetTokens').findOne({ _id: hashed });
  if (!doc || doc.used || doc.expiresAt.getTime() < Date.now()) {
    return null;
  }

  await db.collection<ResetTokenDoc>('passwordResetTokens').updateOne({ _id: hashed }, { $set: { used: true } });
  return doc.email;
}
