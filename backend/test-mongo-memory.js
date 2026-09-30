const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function run() {
  console.log('Starting MongoMemoryServer...');
  const mongoServer = await MongoMemoryServer.create();
  console.log('MongoMemoryServer started. URI:', mongoServer.getUri());
  
  await mongoose.connect(mongoServer.getUri());
  console.log('Mongoose connected. ReadyState:', mongoose.connection.readyState);
  
  const Company = mongoose.model('Company', new mongoose.Schema({ name: String }));
  await Company.create({ name: 'Test' });
  console.log('Company created');
  
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Done');
}

run().catch(console.error);
