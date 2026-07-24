const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Donation = require('./models/Donation');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annadaan';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/annadaan';

const seed = async () => {
  try {
    let connected = false;
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ Connected to MongoDB Atlas successfully!');
      connected = true;
    } catch (err) {
      console.warn(`⚠️ MongoDB Atlas timed out / blocked by Wi-Fi firewall: ${err.message}`);
    }

    if (!connected) {
      try {
        console.log('🔄 Attempting local MongoDB (mongodb://127.0.0.1:27017/annadaan)...');
        await mongoose.connect(LOCAL_MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ Connected to Local MongoDB!');
        connected = true;
      } catch {
        console.warn('⚠️ Local MongoDB service unreachable.');
      }
    }

    if (!connected) {
      console.log('⚡ Launching In-Memory MongoDB Engine for seeding...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('✅ In-Memory Database Engine initialized!');
    }

    // Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@annadaan.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9000000001',
      address: 'Annadaan HQ, Bangalore',
      location: { lat: 12.9716, lng: 77.5946 },
    });

    const donor1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@donor.com',
      password: hashedPassword,
      role: 'donor',
      phone: '9000000002',
      address: 'MG Road, Bangalore',
      location: { lat: 12.9758, lng: 77.6045 },
    });

    const donor2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@donor.com',
      password: hashedPassword,
      role: 'donor',
      phone: '9000000003',
      address: 'Koramangala, Bangalore',
      location: { lat: 12.9352, lng: 77.6245 },
    });

    const vol1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@volunteer.com',
      password: hashedPassword,
      role: 'volunteer',
      phone: '9000000004',
      address: 'Indiranagar, Bangalore',
      location: { lat: 12.9784, lng: 77.6408 },
    });

    const vol2 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@volunteer.com',
      password: hashedPassword,
      role: 'volunteer',
      phone: '9000000005',
      address: 'Whitefield, Bangalore',
      location: { lat: 12.9698, lng: 77.7500 },
    });

    const rec1 = await User.create({
      name: 'Hope Shelter',
      email: 'hope@recipient.com',
      password: hashedPassword,
      role: 'recipient',
      phone: '9000000006',
      address: 'Jayanagar, Bangalore',
      location: { lat: 12.9250, lng: 77.5938 },
    });

    const rec2 = await User.create({
      name: 'Sunrise Orphanage',
      email: 'sunrise@recipient.com',
      password: hashedPassword,
      role: 'recipient',
      phone: '9000000007',
      address: 'BTM Layout, Bangalore',
      location: { lat: 12.9166, lng: 77.6101 },
    });

    console.log('👥 Created 7 users (1 admin, 2 donors, 2 volunteers, 2 recipients)');

    // Create donations
    const now = new Date();
    const donations = await Donation.insertMany([
      {
        donor: donor1._id,
        foodType: 'Cooked Rice & Curry',
        quantity: '15 kg',
        description: 'Leftover from wedding reception, fresh and hygienic',
        pickupAddress: 'MG Road, Bangalore',
        pickupLocation: { lat: 12.9758, lng: 77.6045 },
        expiryWindow: new Date(now.getTime() + 6 * 3600000),
        status: 'pending',
        createdAt: new Date(now.getTime() - 2 * 3600000),
      },
      {
        donor: donor1._id,
        foodType: 'Fresh Fruits',
        quantity: '10 kg',
        description: 'Assorted seasonal fruits - bananas, apples, oranges',
        pickupAddress: 'MG Road, Bangalore',
        pickupLocation: { lat: 12.9758, lng: 77.6045 },
        expiryWindow: new Date(now.getTime() + 24 * 3600000),
        status: 'matched',
        matchedVolunteer: vol1._id,
        matchedRecipient: rec1._id,
        createdAt: new Date(now.getTime() - 12 * 3600000),
      },
      {
        donor: donor2._id,
        foodType: 'Bread & Pastries',
        quantity: '5 kg',
        description: 'Day-old bakery items, still good for consumption',
        pickupAddress: 'Koramangala, Bangalore',
        pickupLocation: { lat: 12.9352, lng: 77.6245 },
        expiryWindow: new Date(now.getTime() + 12 * 3600000),
        status: 'picked_up',
        matchedVolunteer: vol1._id,
        matchedRecipient: rec2._id,
        createdAt: new Date(now.getTime() - 24 * 3600000),
      },
      {
        donor: donor2._id,
        foodType: 'Dal & Roti',
        quantity: '8 kg',
        description: 'Home-cooked dal and fresh rotis',
        pickupAddress: 'Koramangala, Bangalore',
        pickupLocation: { lat: 12.9352, lng: 77.6245 },
        expiryWindow: new Date(now.getTime() + 4 * 3600000),
        status: 'delivered',
        matchedVolunteer: vol2._id,
        matchedRecipient: rec1._id,
        proofOfDelivery: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
        createdAt: new Date(now.getTime() - 48 * 3600000),
      },
      {
        donor: donor1._id,
        foodType: 'Biryani',
        quantity: '20 kg',
        description: 'Party leftover biryani, packed in containers',
        pickupAddress: 'MG Road, Bangalore',
        pickupLocation: { lat: 12.9758, lng: 77.6045 },
        expiryWindow: new Date(now.getTime() + 3 * 3600000),
        status: 'delivered',
        matchedVolunteer: vol1._id,
        matchedRecipient: rec2._id,
        proofOfDelivery: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        createdAt: new Date(now.getTime() - 72 * 3600000),
      },
      {
        donor: donor2._id,
        foodType: 'Milk & Curd',
        quantity: '10 liters',
        description: 'Fresh dairy products from local farm',
        pickupAddress: 'Koramangala, Bangalore',
        pickupLocation: { lat: 12.9352, lng: 77.6245 },
        expiryWindow: new Date(now.getTime() - 2 * 3600000),
        status: 'cancelled',
        createdAt: new Date(now.getTime() - 96 * 3600000),
      },
    ]);

    console.log(`🍱 Created ${donations.length} donations`);

    // Create some notifications
    await Notification.insertMany([
      { userId: donor1._id, message: 'Your donation of "Cooked Rice & Curry" has been submitted.', read: false },
      { userId: donor1._id, message: 'Your donation "Fresh Fruits" has been matched!', read: true },
      { userId: vol1._id, message: 'New pickup task: "Fresh Fruits" at MG Road, Bangalore.', read: false },
      { userId: rec1._id, message: 'A donation of "Fresh Fruits" (10 kg) has been matched to you.', read: false },
      { userId: donor2._id, message: 'Donation "Dal & Roti" has been delivered successfully!', read: true },
      { userId: vol2._id, message: 'New pickup task: "Dal & Roti" at Koramangala, Bangalore.', read: true },
    ]);

    console.log('🔔 Created sample notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials (all passwords: password123):');
    console.log('   Admin:     admin@annadaan.com');
    console.log('   Donor 1:   rajesh@donor.com');
    console.log('   Donor 2:   priya@donor.com');
    console.log('   Volunteer: amit@volunteer.com');
    console.log('   Volunteer: sneha@volunteer.com');
    console.log('   Recipient: hope@recipient.com');
    console.log('   Recipient: sunrise@recipient.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
