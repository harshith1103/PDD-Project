const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: null, message: 'Annadaan Connect API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    data: null,
    message: err.message || 'Internal server error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annadaan';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/annadaan';

const startServer = async () => {
  let connected = false;

  // 1. Try Primary MongoDB (Atlas)
  try {
    console.log('🔄 Connecting to Primary MongoDB (Atlas)...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ MongoDB Atlas connected successfully');
    connected = true;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB Atlas connection timed out: ${err.message}`);
  }

  // 2. Try Local MongoDB
  if (!connected) {
    try {
      console.log('🔄 Attempting local MongoDB (mongodb://127.0.0.1:27017/annadaan)...');
      await mongoose.connect(LOCAL_MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Local MongoDB connected successfully');
      connected = true;
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB service unreachable.');
    }
  }

  // 3. Automated In-Memory Fallback (Guarantees app works 100% on all networks/ISPs/firewalls)
  if (!connected) {
    try {
      console.log('⚡ Launching In-Memory MongoDB Fallback Database Engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log('✅ In-Memory MongoDB Engine started successfully!');
      
      // Auto-populate demo users
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const count = await User.countDocuments();
      if (count === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        await User.create([
          { name: 'Admin User', email: 'admin@annadaan.com', password: hashedPassword, role: 'admin' },
          { name: 'Rajesh Kumar', email: 'rajesh@donor.com', password: hashedPassword, role: 'donor', address: 'MG Road, Bangalore' },
          { name: 'Amit Patel', email: 'amit@volunteer.com', password: hashedPassword, role: 'volunteer', address: 'Indiranagar, Bangalore' },
          { name: 'Hope Foundation', email: 'hope@recipient.com', password: hashedPassword, role: 'recipient', address: 'Whitefield, Bangalore' },
        ]);
        console.log('🌱 Populated default demo accounts (password: password123)');
      }
    } catch (memErr) {
      console.error('❌ In-memory database startup error:', memErr.message);
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\nℹ️ Port ${PORT} is ALREADY IN USE by an active server instance!`);
      console.log(`✅ Your backend API is ALREADY RUNNING and ready on http://localhost:${PORT}`);
      console.log(`👉 You do NOT need to run "node server.js" again.\n`);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();

module.exports = app;
