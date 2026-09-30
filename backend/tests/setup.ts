import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  console.log('setup.ts: beforeAll started');
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  console.log('setup.ts: MongoMemoryReplSet created');
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('setup.ts: mongoose connected');
}, 120000);

afterAll(async () => {
  console.log('setup.ts: afterAll started');
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
