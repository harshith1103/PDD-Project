const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const delivered = await Donation.countDocuments({ status: 'delivered' });
    const pending = await Donation.countDocuments({ status: 'pending' });
    const matched = await Donation.countDocuments({ status: 'matched' });
    const pickedUp = await Donation.countDocuments({ status: 'picked_up' });
    const cancelled = await Donation.countDocuments({ status: 'cancelled' });
    const activeVolunteers = await User.countDocuments({ role: 'volunteer' });
    const foodSavedKg = delivered * 10;

    res.json({
      success: true,
      data: { totalDonations, delivered, pending, matched, pickedUp, cancelled, activeVolunteers, foodSavedKg },
      message: 'Analytics summary retrieved',
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching analytics' });
  }
};

// @desc    Get donation trends (monthly)
// @route   GET /api/analytics/trends
const getTrends = async (req, res) => {
  try {
    const trends = await Donation.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedTrends = trends.map((t) => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      total: t.count,
      delivered: t.delivered,
    }));

    res.json({ success: true, data: formattedTrends, message: 'Donation trends retrieved' });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching trends' });
  }
};

module.exports = { getSummary, getTrends };
