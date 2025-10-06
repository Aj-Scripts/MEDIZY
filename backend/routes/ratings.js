const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// Get doctor's ratings
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort('-createdAt');
    res.json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ message: 'Error fetching ratings', error: err.message });
  }
});

// Submit a rating
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, rating, review } = req.body;

    // Input validation
    if (!doctorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating data provided' });
    }

    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can submit ratings' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for existing rating from this patient
    const existingRating = await Rating.findOne({
      doctor: doctorId,
      patient: req.user.id
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this doctor' });
    }

    console.log('Creating rating:', { doctorId, patientId: req.user.id, rating });

    // Create new rating
    const newRating = await Rating.create({
      doctor: doctorId,
      patient: req.user.id,
      rating: Number(rating),
      review: review || ''
    });

    // Update doctor's average rating
    const allRatings = await Rating.find({ doctor: doctorId });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        rating: Number(averageRating.toFixed(1)),
        ratingCount: allRatings.length
      },
      { new: true }
    );

    console.log('Updated doctor rating:', { 
      doctorId, 
      newRating: updatedDoctor.rating, 
      ratingCount: updatedDoctor.ratingCount 
    });

    res.json({ 
      rating: newRating,
      doctorRating: updatedDoctor.rating,
      ratingCount: updatedDoctor.ratingCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting rating', error: err.message });
  }
});

// Update a rating
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    // Find the rating and check ownership
    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (existingRating.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }

    // Update rating
    existingRating.rating = rating;
    existingRating.review = review;
    await existingRating.save();

    // Update doctor's average rating
    const allRatings = await Rating.find({ doctor: existingRating.doctor });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    await Doctor.findByIdAndUpdate(existingRating.doctor, {
      rating: Number(averageRating.toFixed(1)),
      ratingCount: allRatings.length
    });

    res.json(existingRating);
  } catch (err) {
    res.status(500).json({ message: 'Error updating rating', error: err.message });
  }
});

module.exports = router;