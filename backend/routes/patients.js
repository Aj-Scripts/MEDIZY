const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all patients (admin/doctor access)
router.get('/', auth, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
});

// Get single patient
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient', error: err.message });
  }
});

// Update patient profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update patient', error: err.message });
  }
});

// Delete patient (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete patient', error: err.message });
  }
});

module.exports = router;