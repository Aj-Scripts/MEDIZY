const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const auth = require('../middleware/auth');

// list doctors with user info
router.get('/', async (req, res) => {
  try {
    const docs = await Doctor.find().populate('user', '-password');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
});

// Get single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).populate('user', '-password');
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor', error: err.message });
  }
});

// Get doctor by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const doc = await Doctor.findOne({ user: req.params.userId }).populate('user', '-password');
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor', error: err.message });
  }
});

// create doctor profile (admin or doctor)
router.post('/', async (req, res) => {
  try {
    const { userId, qualifications, experienceYears, fees } = req.body;
    
    // Validation
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if doctor profile already exists for this user
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }
    
    const doc = await Doctor.create({ 
      user: userId, 
      qualifications: qualifications || '', 
      experienceYears: experienceYears || 0, 
      fees: fees || 0,
      availableSlots: []
    });
    
    // Populate user data before sending response
    const populatedDoc = await Doctor.findById(doc._id).populate('user', '-password');
    res.status(201).json(populatedDoc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create doctor', error: err.message });
  }
});

// update doctor profile
router.put('/:id', async (req, res) => {
  try {
    const { qualifications, experienceYears, fees } = req.body;
    const doc = await Doctor.findByIdAndUpdate(
      req.params.id,
      { qualifications, experienceYears, fees },
      { new: true, runValidators: true }
    ).populate('user', '-password');
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update doctor', error: err.message });
  }
});

// update doctor schedule
router.put('/:id/schedule', async (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule) {
      return res.status(400).json({ message: 'Schedule is required' });
    }

    const doc = await Doctor.findByIdAndUpdate(
      req.params.id,
      { schedule },
      { new: true, runValidators: true }
    ).populate('user', '-password');

    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule', error: err.message });
  }
});

// Get available slots for a doctor
router.get('/:id/slots', auth, async (req, res) => {
  try {
    // Try to find by Doctor ID first
    let doc = await Doctor.findById(req.params.id);
    
    // If not found, try to find by User ID
    if (!doc) {
      doc = await Doctor.findOne({ user: req.params.id });
    }
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doc.availableSlots || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch slots', error: err.message });
  }
});

// Add available slot for a doctor
router.post('/:id/slots', auth, async (req, res) => {
  try {
    const { date, from, to } = req.body;
    
    if (!date || !from || !to) {
      return res.status(400).json({ message: 'Date, from, and to are required' });
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(from) || !timeRegex.test(to)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }
    
    // Try to find by Doctor ID first
    let doc = await Doctor.findById(req.params.id);
    
    // If not found, try to find by User ID
    if (!doc) {
      doc = await Doctor.findOne({ user: req.params.id });
    }
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if slot already exists for the same date and time
    const existingSlot = doc.availableSlots.find(slot => {
      const slotDate = new Date(slot.date).toISOString().slice(0, 10);
      const newDate = new Date(date).toISOString().slice(0, 10);
      return slotDate === newDate && slot.from === from && slot.to === to;
    });
    
    if (existingSlot) {
      return res.status(400).json({ message: 'Slot already exists for this date and time' });
    }
    
    // Add new slot
    const newSlot = {
      date: new Date(date),
      from,
      to,
      _id: require('mongoose').Types.ObjectId()
    };
    
    doc.availableSlots.push(newSlot);
    await doc.save();
    
    res.status(201).json(newSlot);
  } catch (err) {
    console.error('Add slot error:', err);
    res.status(500).json({ message: 'Failed to add slot', error: err.message });
  }
});

// Delete available slot
router.delete('/:id/slots/:slotId', auth, async (req, res) => {
  try {
    // Try to find by Doctor ID first
    let doc = await Doctor.findById(req.params.id);
    
    // If not found, try to find by User ID
    if (!doc) {
      doc = await Doctor.findOne({ user: req.params.id });
    }
    
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find and remove the slot
    const slotIndex = doc.availableSlots.findIndex(
      slot => slot._id.toString() === req.params.slotId
    );
    
    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    doc.availableSlots.splice(slotIndex, 1);
    await doc.save();
    
    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    console.error('Delete slot error:', err);
    res.status(500).json({ message: 'Failed to delete slot', error: err.message });
  }
});

// rate a doctor (patient)
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating === undefined) return res.status(400).json({ message: 'Rating is required' });
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    // simple aggregate
    const total = (doc.rating || 0) * (doc.ratingCount || 0);
    const newCount = (doc.ratingCount || 0) + 1;
    const newRating = (total + Number(rating)) / newCount;
    doc.rating = Number(newRating.toFixed(2));
    doc.ratingCount = newCount;
    await doc.save();
    const populated = await Doctor.findById(doc._id).populate('user', '-password');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate doctor', error: err.message });
  }
});

// Delete doctor profile
router.delete('/:id', async (req, res) => {
  try {
    console.log('Attempting to delete doctor with ID:', req.params.id);
    
    const doc = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doc) {
      console.log('Doctor not found');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    console.log('Doctor deleted successfully:', doc);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete doctor', error: err.message });
  }
});

module.exports = router;