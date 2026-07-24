const { validationResult, body } = require('express-validator');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

const createDonationValidation = [
  body('foodType').trim().notEmpty().withMessage('Food type is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('expiryWindow').isISO8601().withMessage('Valid expiry date is required'),
];

// @desc    Create a new donation
// @route   POST /api/donations
const createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, data: null, message: errors.array()[0].msg });
    }

    const { foodType, quantity, description, pickupAddress, pickupLocation, expiryWindow } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      foodType,
      quantity,
      description: description || '',
      pickupAddress,
      pickupLocation: pickupLocation || { lat: 0, lng: 0 },
      expiryWindow,
      status: 'pending',
    });

    await Notification.create({
      userId: req.user._id,
      message: `Your donation of "${foodType}" has been submitted successfully.`,
    });

    const populated = await Donation.findById(donation._id).populate('donor', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Donation created successfully',
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error creating donation' });
  }
};

// @desc    Get all donations (admin/volunteer)
// @route   GET /api/donations
const getAllDonations = async (req, res) => {
  try {
    const { status, donor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (donor) filter.donor = donor;

    // If user is a recipient, restrict to their incoming donations
    if (req.user && req.user.role === 'recipient') {
      filter.matchedRecipient = req.user._id;
    }

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone')
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
      message: 'Donations retrieved',
    });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching donations' });
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
      message: 'Your donations retrieved',
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching your donations' });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address');

    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Donation not found' });
    }

    res.json({ success: true, data: donation, message: 'Donation retrieved' });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching donation' });
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'matched', 'picked_up', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Donation not found' });
    }

    donation.status = status;
    await donation.save();

    // Notifications on status change
    const statusMessages = {
      picked_up: `Donation "${donation.foodType}" has been picked up by the volunteer.`,
      delivered: `Donation "${donation.foodType}" has been delivered successfully!`,
      cancelled: `Donation "${donation.foodType}" has been cancelled.`,
    };

    if (statusMessages[status]) {
      await Notification.create({ userId: donation.donor, message: statusMessages[status] });
      if (donation.matchedRecipient) {
        await Notification.create({ userId: donation.matchedRecipient, message: statusMessages[status] });
      }
    }

    const updated = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('matchedVolunteer', 'name email')
      .populate('matchedRecipient', 'name email');

    res.json({ success: true, data: updated, message: `Donation status updated to "${status}"` });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error updating donation status' });
  }
};

// @desc    Upload proof of delivery
// @route   POST /api/donations/:id/proof
const uploadProof = async (req, res) => {
  try {
    const { proofOfDelivery } = req.body;
    if (!proofOfDelivery) {
      return res.status(400).json({ success: false, data: null, message: 'Proof of delivery URL is required' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Donation not found' });
    }

    donation.proofOfDelivery = proofOfDelivery;
    await donation.save();

    res.json({ success: true, data: donation, message: 'Proof of delivery uploaded' });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error uploading proof' });
  }
};

// @desc    Get public feed (pending and completed donations)
// @route   GET /api/donations/public-feed
const getPublicFeed = async (req, res) => {
  try {
    const pendingDonations = await Donation.find({ status: 'pending' })
      .populate('donor', 'name')
      .sort({ createdAt: -1 });
      
    const completedDonations = await Donation.find({ status: 'delivered' })
      .populate('donor', 'name')
      .populate('matchedVolunteer', 'name')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        pending: pendingDonations,
        completed: completedDonations
      },
      message: 'Public feed retrieved',
    });
  } catch (error) {
    console.error('Get public feed error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching public feed' });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
  uploadProof,
  createDonationValidation,
  getPublicFeed,
};
