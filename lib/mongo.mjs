import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || process.env.DRUNKMAXX_MONGO_DB || 'drunkmaxx';

let clientPromise;

export function getMongoUriStatus() {
  return Boolean(uri);
}

export async function getMongoDb() {
  if (!uri) {
    throw new Error('MONGO_URI is required for scrape job API routes.');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db(dbName);
}
