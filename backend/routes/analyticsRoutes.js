const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getSummary, getTrends } = require('../controllers/analyticsController');

router.get('/summary', authMiddleware, roleMiddleware('admin'), getSummary);
router.get('/trends', authMiddleware, roleMiddleware('admin'), getTrends);

module.exports = router;
