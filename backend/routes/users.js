const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Update user request:', { body: req.body, userId: req.params.id });
    
    const { name, email, specialization, phone, address, image, gender, birthday } = req.body;
    
    // Validate user exists
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create update object with sanitized fields
    const update = {};
    if (name && typeof name === 'string') update.name = name.trim();
    if (email && typeof email === 'string') update.email = email.trim().toLowerCase();
    if (specialization !== undefined) update.specialization = specialization || '';
    if (phone !== undefined) update.phone = phone || '';
    if (address !== undefined) update.address = address || '';
    if (gender !== undefined) update.gender = gender || 'unspecified';
    if (birthday !== undefined && birthday !== null) update.birthday = birthday;
    if (image !== undefined) update.image = image || '';

    console.log('Updating user with:', update);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;