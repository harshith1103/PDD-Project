const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Haversine distance (km)
const haversineDistance = (loc1, loc2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc    Auto-match nearest volunteer and recipient to a donation
// @route   POST /api/match/:donationId
const autoMatch = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Donation not found' });
    }
    if (donation.status !== 'pending') {
      return res.status(400).json({ success: false, data: null, message: 'Only pending donations can be matched' });
    }

    const pickupLoc = donation.pickupLocation;

    const volunteers = await User.find({ role: 'volunteer' });
    if (volunteers.length === 0) {
      return res.status(400).json({ success: false, data: null, message: 'No volunteers available' });
    }

    const recipients = await User.find({ role: 'recipient' });
    if (recipients.length === 0) {
      return res.status(400).json({ success: false, data: null, message: 'No recipients available' });
    }

    // Find nearest volunteer
    let nearestVol = volunteers[0];
    let minVolDist = haversineDistance(pickupLoc, volunteers[0].location);
    for (let i = 1; i < volunteers.length; i++) {
      const d = haversineDistance(pickupLoc, volunteers[i].location);
      if (d < minVolDist) { minVolDist = d; nearestVol = volunteers[i]; }
    }

    // Find nearest recipient
    let nearestRec = recipients[0];
    let minRecDist = haversineDistance(pickupLoc, recipients[0].location);
    for (let i = 1; i < recipients.length; i++) {
      const d = haversineDistance(pickupLoc, recipients[i].location);
      if (d < minRecDist) { minRecDist = d; nearestRec = recipients[i]; }
    }

    donation.matchedVolunteer = nearestVol._id;
    donation.matchedRecipient = nearestRec._id;
    donation.status = 'matched';
    await donation.save();

    // Notifications
    await Notification.create({
      userId: nearestVol._id,
      message: `New pickup task: "${donation.foodType}" at ${donation.pickupAddress}.`,
    });
    await Notification.create({
      userId: nearestRec._id,
      message: `A donation of "${donation.foodType}" (${donation.quantity}) has been matched to you.`,
    });
    await Notification.create({
      userId: donation.donor,
      message: `Your donation "${donation.foodType}" has been matched!`,
    });

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address');

    res.json({
      success: true,
      data: populated,
      message: `Matched: volunteer "${nearestVol.name}" (${minVolDist.toFixed(1)} km), recipient "${nearestRec.name}" (${minRecDist.toFixed(1)} km)`,
    });
  } catch (error) {
    console.error('Auto-match error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error during matching' });
  }
};

module.exports = { autoMatch };
