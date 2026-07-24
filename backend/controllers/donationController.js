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

// @desc    Get all donations (admin/volunteer/recipient)
// @route   GET /api/donations
const getAllDonations = async (req, res) => {
  try {
    const { status, donor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (donor) filter.donor = donor;

    // If user is a recipient, show donations matched to them OR available pending/unmatched donations from donors
    if (req.user && req.user.role === 'recipient') {
      filter.$or = [
        { matchedRecipient: req.user._id },
        { status: 'pending' },
        { status: 'matched', matchedRecipient: null },
      ];
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
// @desc    Recipient requests / selects an available food donation from a donor
// @route   PUT /api/donations/:id/request
const requestDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Donation not found' });
    }

    // Check user is registered as recipient
    if (req.user.role !== 'recipient') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only registered recipients can request food options',
      });
    }

    // Ensure recipient is not the donor
    if (String(donation.donor?._id || donation.donor) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Donor cannot claim their own food donation',
      });
    }

    // Check if already claimed by another recipient
    if (
      donation.matchedRecipient &&
      String(donation.matchedRecipient) !== String(req.user._id)
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Donation has already been claimed by another recipient',
      });
    }

    // Check if donation is delivered or cancelled
    if (['delivered', 'cancelled'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Donation is no longer available',
      });
    }

    // If already matched to this recipient, return success
    if (
      donation.matchedRecipient &&
      String(donation.matchedRecipient) === String(req.user._id)
    ) {
      const existingPopulated = await Donation.findById(donation._id)
        .populate('donor', 'name email phone address')
        .populate('matchedVolunteer', 'name email phone')
        .populate('matchedRecipient', 'name email phone address');

      return res.json({
        success: true,
        data: existingPopulated,
        message: 'Food requested successfully! Assigned to you.',
      });
    }

    donation.matchedRecipient = req.user._id;
    donation.status = 'matched';
    await donation.save();

    const recipientUser = await User.findById(req.user._id);
    const donorUser = await User.findById(donation.donor);

    // Notify Donor
    await Notification.create({
      userId: donation.donor,
      message: `Recipient "${recipientUser?.name || 'A recipient'}" accepted/requested your food donation of "${donation.foodType}".`,
    });

    // Notify Recipient
    await Notification.create({
      userId: req.user._id,
      message: `You successfully requested "${donation.foodType}" from donor ${donorUser?.name || ''}. Waiting for volunteer pickup.`,
    });

    // Notify Volunteers about the new matched request needing pickup & delivery
    const volunteers = await User.find({ role: 'volunteer' });
    for (const vol of volunteers) {
      await Notification.create({
        userId: vol._id,
        message: `New Pickup Task: Donor "${donorUser?.name || 'Donor'}" is donating "${donation.foodType}" for recipient "${recipientUser?.name || 'Recipient'}".`,
      });
    }

    const updated = await Donation.findById(donation._id)
      .populate('donor', 'name email phone address')
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address');

    res.json({
      success: true,
      data: updated,
      message: 'Food requested successfully! Volunteers notified for pickup.',
    });
  } catch (error) {
    console.error('Request donation error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error requesting donation' });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
  uploadProof,
  requestDonation,
  createDonationValidation,
  getPublicFeed,
};
