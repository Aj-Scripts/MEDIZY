const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate ratings from same patient for same doctor
ratingSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);