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
    const { recipientId } = req.body || {};

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }
    if (donation.matchedVolunteer) {
      return res.status(400).json({ success: false, data: null, message: 'Task already accepted by another volunteer' });
    }
    if (donation.status !== 'pending' && donation.status !== 'matched') {
      return res.status(400).json({ success: false, data: null, message: 'Task is no longer available' });
    }

    // Check role is volunteer
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only registered volunteers can accept delivery tasks',
      });
    }

    const targetRecipientId = donation.matchedRecipient || recipientId;
    if (!targetRecipientId) {
      return res.status(400).json({ success: false, data: null, message: 'Recipient selection is required' });
    }

    const donorId = String(donation.donor?._id || donation.donor || '');
    const recId = String(targetRecipientId?._id || targetRecipientId || '');
    const volId = String(req.user._id);

    if (volId === donorId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Volunteer cannot be the same person as the donor',
      });
    }

    if (volId === recId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Volunteer cannot be the same person as the recipient',
      });
    }

    donation.matchedVolunteer = req.user._id;
    donation.matchedRecipient = targetRecipientId;
    donation.status = 'matched';
    await donation.save();

    await Notification.create({
      userId: donation.donor,
      message: `Volunteer "${req.user.name}" accepted the pickup request for "${donation.foodType}".`,
    });

    await Notification.create({
      userId: targetRecipientId,
      message: `Volunteer "${req.user.name}" accepted the delivery request for "${donation.foodType}".`,
    });

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name email phone address')
      .populate('matchedVolunteer', 'name email phone')
      .populate('matchedRecipient', 'name email phone address');

    res.json({ success: true, data: populated, message: 'Task accepted successfully' });
  } catch (error) {
    console.error('Accept task error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error accepting task' });
  }
};

// @desc    Get all available tasks (pending OR matched requests awaiting a volunteer)
// @route   GET /api/volunteers/available-tasks
const getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Donation.find({
      matchedVolunteer: null,
      status: { $in: ['pending', 'matched'] },
    })
      .populate('donor', 'name email phone address')
      .populate('matchedRecipient', 'name email phone address')
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
