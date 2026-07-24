const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { autoMatch } = require('../controllers/matchController');

router.post('/:donationId', authMiddleware, roleMiddleware('admin'), autoMatch);

module.exports = router;
