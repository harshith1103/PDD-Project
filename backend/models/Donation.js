const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    trim: true,
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  pickupAddress: {
    type: String,
    required: [true, 'Pickup address is required'],
  },
  pickupLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  expiryWindow: {
    type: Date,
    required: [true, 'Expiry window is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending',
  },
  matchedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  matchedRecipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  proofOfDelivery: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
