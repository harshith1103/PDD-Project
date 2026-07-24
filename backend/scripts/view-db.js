const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annadaan';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/annadaan';

async function inspectDatabase() {
  try {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    } catch {
      await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 2000 }).catch(() => {});
    }

    console.log(`\n=======================================================`);
    console.log(`📦 ANNADAAN CONNECT — DATABASE INSPECTOR`);
    console.log(`=======================================================`);

    // 1. Users
    const users = await User.find({}).lean().catch(() => []);
    console.log(`\n👥 REGISTERED USERS (${users.length} Total):`);
    if (users.length > 0) {
      console.table(
        users.map((u) => ({
          ID: u._id.toString().substring(18),
          Name: u.name,
          Email: u.email,
          Role: (u.role || '').toUpperCase(),
          Address: u.address || 'N/A',
        }))
      );
    } else {
      console.log('   (Database empty or running on in-memory instance)');
    }

    // 2. Donations
    const donations = await Donation.find({}).lean().catch(() => []);
    console.log(`\n🍲 FOOD DONATIONS (${donations.length} Total):`);
    if (donations.length > 0) {
      console.table(
        donations.map((d) => ({
          Food: d.foodItem || d.title,
          Quantity: `${d.quantity} servings`,
          Status: d.status,
          Location: d.pickupAddress || d.address || 'N/A',
        }))
      );
    } else {
      console.log('   (No food donations created yet)');
    }

    console.log(`=======================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting database:', err.message);
    process.exit(1);
  }
}

inspectDatabase();
