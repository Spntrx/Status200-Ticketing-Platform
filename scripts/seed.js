require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Ticket model undefined. Will add later 
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// 1 admin for now
const admin = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'Admin@12345',
  role: 'admin'
};
// 10 users
const users = Array.from({ length: 10 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  password: 'Password@123',
  role: 'user'
}));

const importData = async () => {
  await User.deleteMany();

  // create() runs the pre('save') hook, so passwords get hashed.
  // (insertMany would skip it and store plain-text passwords.)
  await User.create([admin, ...users]);

  console.log('Seed complete: 1 admin + 10 users created');
  console.log(`Admin login: ${admin.email} / ${admin.password}`);
};

const destroyData = async () => {
  await User.deleteMany();
  console.log('All users removed');
};

const run = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not set in your environment/.env');
    }
    await mongoose.connect(MONGO_URI);

    if (process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();