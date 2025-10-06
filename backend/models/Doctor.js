const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qualifications: { type: String },
  experienceYears: { type: Number },
  fees: { type: Number },
  availableSlots: [{ date: Date, from: String, to: String }],
  schedule: {
    type: Map,
    of: [String],
    default: () => new Map([
      ['Monday', []],
      ['Tuesday', []],
      ['Wednesday', []],
      ['Thursday', []],
      ['Friday', []],
      ['Saturday', []],
      ['Sunday', []]
    ])
  },
  rating: { type: Number, default: 5 },
  ratingCount: { type: Number, default: 0 }
});
module.exports = mongoose.model('Doctor', doctorSchema);
