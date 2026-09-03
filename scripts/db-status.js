const { loadEnv } = require('./_env');
loadEnv();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
  console.log('connected to db:', mongoose.connection.name);
  const cols = await mongoose.connection.db.listCollections().toArray();
  if (!cols.length) console.log('(no collections)');
  for (const c of cols.map((x) => x.name).sort()) {
    const n = await mongoose.connection.db.collection(c).countDocuments();
    console.log(String(n).padStart(6), c);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
