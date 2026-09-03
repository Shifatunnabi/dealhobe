#!/usr/bin/env node
/*
 * One-time migration: copy every collection from the local MongoDB
 * (active MONGODB_URI in .env.local) to the Atlas cluster (the commented-out
 * MONGODB_URI line). Wipes each target collection first, then inserts —
 * safe to re-run.
 */

const { loadEnv } = require('./_env');
loadEnv();

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

function readAtlasUri() {
  const file = path.resolve(process.cwd(), '.env.local');
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.trim().startsWith('# MONGODB_URI'));
  if (!line) throw new Error('No commented-out Atlas MONGODB_URI line found in .env.local');
  return line.replace(/^#\s*MONGODB_URI=/, '').trim();
}

(async () => {
  const localUri = process.env.MONGODB_URI;
  const atlasUri = readAtlasUri();

  const localClient = new MongoClient(localUri, { family: 4 });
  const atlasClient = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 15000 });

  await localClient.connect();
  await atlasClient.connect();

  const localDb = localClient.db();
  const atlasDb = atlasClient.db();
  console.log(`Source (local): "${localDb.databaseName}"`);
  console.log(`Target (Atlas): "${atlasDb.databaseName}"\n`);

  const collections = await localDb.listCollections().toArray();
  let totalDocs = 0;

  for (const { name } of collections) {
    const docs = await localDb.collection(name).find({}).toArray();
    await atlasDb.collection(name).deleteMany({});
    if (docs.length > 0) {
      await atlasDb.collection(name).insertMany(docs, { ordered: false });
    }
    console.log(`  ${name}: ${docs.length} documents`);
    totalDocs += docs.length;
  }

  console.log(`\nMigrated ${totalDocs} documents across ${collections.length} collections.`);

  await localClient.close();
  await atlasClient.close();
})().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
