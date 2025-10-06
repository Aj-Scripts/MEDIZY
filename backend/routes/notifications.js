const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

// Mark as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
    if (!note) return res.status(404).json({ message: 'Notification not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification', error: err.message });
  }
});

// create (internal) - optional external use
router.post('/create', async (req, res) => {
  try {
    const { user, title, body, data } = req.body;
    const note = await Notification.create({ user, title, body, data });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification', error: err.message });
  }
});

module.exports = router;
