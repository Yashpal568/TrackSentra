import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  console.log('setup.ts: beforeAll started');
  mongoServer = await MongoMemoryServer.create();
  console.log('setup.ts: MongoMemoryServer created');
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
