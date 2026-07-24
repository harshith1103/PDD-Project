const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getMyTasks, acceptTask, getAvailableTasks, getRecipients } = require('../controllers/volunteerController');

router.get('/tasks', authMiddleware, roleMiddleware('volunteer'), getMyTasks);
router.put('/tasks/:id/accept', authMiddleware, roleMiddleware('volunteer'), acceptTask);
router.get('/available-tasks', authMiddleware, roleMiddleware('volunteer'), getAvailableTasks);
router.get('/recipients', authMiddleware, roleMiddleware('volunteer'), getRecipients);

module.exports = router;
