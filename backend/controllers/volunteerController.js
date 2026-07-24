const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get tasks assigned to the logged-in volunteer
// @route   GET /api/volunteers/tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Donation.find({ matchedVolunteer: req.user._id })
      .populate('donor', 'name email phone address')
      .populate('matchedRecipient', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks, message: 'Volunteer tasks retrieved' });
  } catch (error) {
    console.error('Get volunteer tasks error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching tasks' });
  }
};

// @desc    Accept a task
// @route   PUT /api/volunteers/tasks/:id/accept
const acceptTask = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ success: false, data: null, message: 'Recipient selection is required' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }
    if (donation.status !== 'pending' && donation.status !== 'matched') {
      return res.status(400).json({ success: false, data: null, message: 'Task is no longer available' });
    }

    donation.matchedVolunteer = req.user._id;
    donation.matchedRecipient = recipientId;
    donation.status = 'picked_up';
    await donation.save();

    await Notification.create({
      userId: donation.donor,
      message: `Volunteer "${req.user.name}" has accepted the pickup task for "${donation.foodType}".`,
    });

    await Notification.create({
      userId: recipientId,
      message: `A donation of "${donation.foodType}" is on its way to you by volunteer "${req.user.name}".`,
    });

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('matchedVolunteer', 'name email')
      .populate('matchedRecipient', 'name email');

    res.json({ success: true, data: populated, message: 'Task accepted successfully' });
  } catch (error) {
    console.error('Accept task error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error accepting task' });
  }
};

// @desc    Get all available pending tasks
// @route   GET /api/volunteers/available-tasks
const getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Donation.find({ status: 'pending' })
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks, message: 'Available tasks retrieved' });
  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching tasks' });
  }
};

// @desc    Get all recipients
// @route   GET /api/volunteers/recipients
const getRecipients = async (req, res) => {
  try {
    const recipients = await User.find({ role: 'recipient' }).select('name email phone address');
    res.json({ success: true, data: recipients, message: 'Recipients retrieved' });
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error fetching recipients' });
  }
};

module.exports = { getMyTasks, acceptTask, getAvailableTasks, getRecipients };
