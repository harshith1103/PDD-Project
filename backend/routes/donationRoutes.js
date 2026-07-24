const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
  uploadProof,
  requestDonation,
  createDonationValidation,
  getPublicFeed,
} = require('../controllers/donationController');

// Public route to get feed
router.get('/public-feed', getPublicFeed);

// Donor creates a donation
router.post('/', authMiddleware, roleMiddleware('donor'), createDonationValidation, createDonation);

// Donor views their own donations — must be before /:id to avoid route conflict
router.get('/my', authMiddleware, roleMiddleware('donor'), getMyDonations);

// Admin/volunteer/recipient views all donations
router.get('/', authMiddleware, roleMiddleware('admin', 'volunteer', 'recipient'), getAllDonations);

// Recipient requests/selects available food donation from donor
router.put('/:id/request', authMiddleware, roleMiddleware('recipient'), requestDonation);

// Get single donation by ID
router.get('/:id', authMiddleware, getDonationById);

// Update donation status (volunteer/admin/recipient)
router.put('/:id/status', authMiddleware, roleMiddleware('volunteer', 'admin', 'recipient'), updateDonationStatus);

// Upload proof of delivery (volunteer)
router.post('/:id/proof', authMiddleware, roleMiddleware('volunteer'), uploadProof);

module.exports = router;
