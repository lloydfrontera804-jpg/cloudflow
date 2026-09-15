import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

// Next.js dev mode hot-reloads modules on every file save. Without this,
// every reload would open a brand new MongoClient/connection pool on top of
// the old ones, and you'd eventually hit Atlas's connection limit. Caching
// the client on `global` survives hot reloads in dev; in production there's
// only ever one module load anyway, so this is a no-op there.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

let indexesEnsured = false;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(); // uses the database named in the MONGODB_URI path

  if (!indexesEnsured) {
    indexesEnsured = true;
    await Promise.all([
      db.collection('sessions').createIndex({ startedAt: -1 }),
      db.collection('sessions').createIndex({ machineId: 1, startedAt: -1 }),
      db.collection('transactions').createIndex({ createdAt: -1 }),
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('machines').createIndex({ tunnelReportKey: 1 }, { unique: true }),
      // TTL index: Mongo automatically deletes a token document once
      // `expiresAt` (a real Date, not a ms number) passes — no manual
      // cleanup job needed for expired/used reset tokens.
      db.collection('passwordResetTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]).catch((err) => console.error('Failed to ensure indexes', err));
  }

  return db;
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}
