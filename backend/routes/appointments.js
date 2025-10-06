const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendAppointmentConfirmation, sendRescheduleNotification } = require('../utils/emailService');

const toMinutes = (t) => { const [hh,mm] = String(t).split(':'); return Number(hh)*60 + Number(mm); };

function overlaps(startA, durA, startB, durB) {
  const a1 = startA;
  const a2 = startA + (durA || 30);
  const b1 = startB;
  const b2 = startB + (durB || 30);
  return Math.max(a1,b1) < Math.min(a2,b2);
}

// Create appointment (patient)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason, paymentMode, amount } = req.body;
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor and date are required' });
    }
    // assign incremental token number per doctor per day
    const day = date; // assuming date is YYYY-MM-DD
    const lastTokenDoc = await Appointment.find({ doctor: doctorId, date }).sort({ tokenNumber: -1 }).limit(1);
    const lastToken = lastTokenDoc[0]?.tokenNumber || 0;
    const tokenNumber = lastToken + 1;

    const appt = await Appointment.create({ 
      patient: req.user._id, 
      doctor: doctorId, 
      date, 
      time, 
      reason,
      paymentMode: paymentMode || 'cash',
      amount: amount || 0,
      status: 'pending',
      tokenNumber
    });
    
    const populated = await Appointment.findById(appt._id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    
    // Send confirmation emails
    try {
      console.log('=== EMAIL SENDING DEBUG ===');
      console.log('Appointment created successfully');
      console.log('Doctor User ID:', doctorId);
      console.log('Patient data:', {
        id: populated.patient?._id,
        name: populated.patient?.name,
        email: populated.patient?.email
      });

      // Find doctor's User record (doctorId is already a User ID)
      const doctorUser = await User.findById(doctorId).select('name email');
      
      console.log('Doctor user data:', {
        id: doctorUser?._id,
        name: doctorUser?.name,
        email: doctorUser?.email
      });
      
      if (populated.patient?.email && doctorUser?.email) {
        console.log('Both emails present, attempting to send...');
        console.log('Sending emails to:', {
          patient: populated.patient.email,
          doctor: doctorUser.email
        });
        
        const emailResult = await sendAppointmentConfirmation({
          patientEmail: populated.patient.email,
          patientName: populated.patient.name,
          doctorName: doctorUser.name,
          doctorEmail: doctorUser.email,
          date,
          time,
          tokenNumber,
          fees: amount || 0,
          appointmentId: appt._id.toString()
        });
        console.log('Email sending result:', JSON.stringify(emailResult, null, 2));
      } else {
        console.log('MISSING EMAIL ADDRESSES:');
        console.log('- Patient email:', populated.patient?.email || 'MISSING');
        console.log('- Doctor email:', doctorUser?.email || 'MISSING');
      }
      console.log('=== END EMAIL DEBUG ===');
    } catch (emailErr) {
      console.error('!!! EMAIL ERROR !!!');
      console.error('Error message:', emailErr.message);
      if (emailErr.response?.body) {
        console.error('SendGrid error details:', JSON.stringify(emailErr.response.body, null, 2));
      }
      console.error('Full error:', emailErr);
      // Don't fail the appointment creation if email fails
    }
    
    res.status(201).json(populated);
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  }
});

// Patient requests reschedule (creates a reschedule request on appointment)
router.post('/:id/reschedule', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Validate that requested time is within doctor's available slots
    const doctorProfile = await Doctor.findOne({ user: appointment.doctor });
    if (doctorProfile && doctorProfile.availableSlots && doctorProfile.availableSlots.length > 0) {
      const match = doctorProfile.availableSlots.some(slot => {
        try {
          const slotDate = new Date(slot.date).toISOString().slice(0,10);
          if (slotDate !== String(date)) return false;
          // compare times HH:MM
          const toMinutes = (t) => { const [hh,mm] = String(t).split(':'); return Number(hh)*60 + Number(mm); };
          const reqMin = toMinutes(time || '00:00');
          const fromMin = toMinutes(slot.from || '00:00');
          const toMin = toMinutes(slot.to || '23:59');
          return reqMin >= fromMin && reqMin <= toMin;
        } catch (e) { return false; }
      });
      if (!match) return res.status(400).json({ message: 'Requested time is not within doctor available slots' });
    }

  // Check for conflict: duration-aware overlap for same doctor on that date
  const reqStart = toMinutes(time || '00:00');
  const reqDur = appointment.duration || 30;
  const sameDayAppointments = await Appointment.find({ _id: { $ne: appointment._id }, doctor: appointment.doctor, date, status: { $ne: 'cancelled' } });
  const hasConflict = sameDayAppointments.some(a => overlaps(reqStart, reqDur, toMinutes(a.time || '00:00'), a.duration || 30));
  if (hasConflict) return res.status(400).json({ message: 'Requested time conflicts with another appointment' });

    appointment.rescheduleRequests = appointment.rescheduleRequests || [];
    const newReq = { requestedBy: req.user._id, date, time, status: 'pending' };
    appointment.rescheduleRequests.push(newReq);
    await appointment.save();

    // notify the doctor
    try {
      await Notification.create({
        user: appointment.doctor,
        title: 'Reschedule requested',
        body: `Patient requested reschedule for ${date} at ${time}`,
        data: { appointmentId: appointment._id }
      });
    } catch (e) { console.error('Notification error', e); }

    // notify admin/doctor could be implemented later (e.g., websockets/emails)
    const updated = await Appointment.findById(appointment._id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit reschedule request', error: err.message });
  }
});

// Admin or doctor accepts a reschedule request
router.post('/:id/reschedule/:reqId/accept', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    // authorization: only admin or the doctor assigned to the appointment can accept
    const userId = req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';
    const isDoctor = appointment.doctor?.toString() === userId;
    if (!isAdmin && !isDoctor) return res.status(403).json({ message: 'Not authorized to accept this reschedule' });

    const reqObj = appointment.rescheduleRequests.id(req.params.reqId);
    if (!reqObj) return res.status(404).json({ message: 'Reschedule request not found' });

    // Store old date/time for email
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    // Availability check: ensure requested date/time is within doctor's slots
    const doctorProfile = await Doctor.findOne({ user: appointment.doctor });
    if (doctorProfile && doctorProfile.availableSlots && doctorProfile.availableSlots.length > 0) {
      const match = doctorProfile.availableSlots.some(slot => {
        try {
          const slotDate = new Date(slot.date).toISOString().slice(0,10);
          if (slotDate !== String(reqObj.date)) return false;
          const toMinutes = (t) => { const [hh,mm] = String(t).split(':'); return Number(hh)*60 + Number(mm); };
          const reqMin = toMinutes(reqObj.time || '00:00');
          const fromMin = toMinutes(slot.from || '00:00');
          const toMin = toMinutes(slot.to || '23:59');
          return reqMin >= fromMin && reqMin <= toMin;
        } catch (e) { return false; }
      });
      if (!match) return res.status(400).json({ message: 'Requested time is not within doctor available slots' });
    }

  // Conflict check: duration-aware overlap for acceptance
  const reqStart2 = toMinutes(reqObj.time || '00:00');
  const reqDur2 = appointment.duration || 30;
  const sameDayAppointments2 = await Appointment.find({ _id: { $ne: appointment._id }, doctor: appointment.doctor, date: reqObj.date, status: { $ne: 'cancelled' } });
  const hasConflict2 = sameDayAppointments2.some(a => overlaps(reqStart2, reqDur2, toMinutes(a.time || '00:00'), a.duration || 30));
  if (hasConflict2) return res.status(400).json({ message: 'Requested time conflicts with another appointment' });

    // accept: set appointment date/time to requested values and mark request accepted
    appointment.date = reqObj.date;
    appointment.time = reqObj.time;
    reqObj.status = 'accepted';
    // mark other requests as rejected
    appointment.rescheduleRequests.forEach(r => { if (r._id.toString() !== reqObj._id.toString()) r.status = 'rejected'; });
    await appointment.save();

    // notify patient
    try {
      await Notification.create({
        user: appointment.patient,
        title: 'Reschedule accepted',
        body: `Your appointment has been rescheduled to ${reqObj.date} at ${reqObj.time}`,
        data: { appointmentId: appointment._id }
      });

      // Send email notification
      console.log('=== RESCHEDULE EMAIL DEBUG ===');
      const populatedAppt = await Appointment.findById(appointment._id)
        .populate('patient', 'name email');

      const doctorUser = await User.findById(appointment.doctor).select('name email');

      console.log('Reschedule email data:', {
        patientEmail: populatedAppt.patient?.email,
        patientName: populatedAppt.patient?.name,
        doctorName: doctorUser?.name,
        oldDate,
        oldTime,
        newDate: reqObj.date,
        newTime: reqObj.time
      });

      if (populatedAppt.patient?.email && doctorUser?.name) {
        const emailResult = await sendRescheduleNotification({
          patientEmail: populatedAppt.patient.email,
          patientName: populatedAppt.patient.name,
          doctorName: doctorUser.name,
          oldDate: oldDate,
          oldTime: oldTime,
          newDate: reqObj.date,
          newTime: reqObj.time,
          status: 'accepted'
        });
        console.log('Reschedule email result:', emailResult);
      } else {
        console.log('Missing data for reschedule email');
      }
      console.log('=== END RESCHEDULE EMAIL DEBUG ===');
    } catch (e) { 
      console.error('Notification/email error:', e);
      if (e.response?.body) {
        console.error('SendGrid error:', e.response.body);
      }
    }

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept reschedule request', error: err.message });
  }
});

// Get all appointments (admin only - with query params)
router.get('/', auth, async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    
    let query = {};
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;
    
    const appointments = await Appointment.find(query)
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Get appointments for current user
router.get('/me', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      $or: [{ patient: req.user._id }, { doctor: req.user._id }] 
    })
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Get appointments for specific doctor
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointment', error: err.message });
  }
});

// Update appointment (PUT)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, date, time } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    
    await appointment.save();
    
    const updated = await Appointment.findById(appointment._id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
});

// Update appointment (PATCH)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, date, time } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    
    await appointment.save();
    
    const updated = await Appointment.findById(appointment._id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
  }
});

module.exports = router;