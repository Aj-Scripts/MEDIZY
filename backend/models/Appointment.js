const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String 
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  tokenNumber: {
    type: Number,
    default: 0
  },
  rescheduleRequests: [{
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: String },
    time: { type: String },
    status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  reason: { 
    type: String 
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'stripe', 'razorpay', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);