const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medizy');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await Doctor.deleteMany();
  await Appointment.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@medizy.com',
    password: adminPassword,
    role: 'admin'
  });

  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await User.create({
    name: 'Dr. Rahul Sharma',
    email: 'doctor@medizy.com',
    password: doctorPassword,
    role: 'doctor',
    specialization: 'Cardiology'
  });

  const doctorProfile = await Doctor.create({
    user: doctorUser._id,
    qualifications: 'MBBS, MD',
    experienceYears: 10,
    fees: 500,
    availableSlots: [
      { date: new Date(), from: '10:00', to: '12:00' },
      { date: new Date(), from: '14:00', to: '16:00' }
    ]
  });

  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await User.create({
    name: 'Arjun Kumar',
    email: 'patient@medizy.com',
    password: patientPassword,
    role: 'patient'
  });

  await Appointment.create({
    patient: patient._id,
    doctor: doctorUser._id,
    date: new Date(),
    time: '10:30',
    reason: 'General Checkup',
    status: 'confirmed'
  });

  console.log('Seed complete');
  process.exit();
};

seed();
