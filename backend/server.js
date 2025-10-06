const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ADD THIS

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medizy')
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/users', require('./routes/users'));

// UPDATED: Use absolute path
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/uploads', require('./routes/uploads'));

const captchaRoute = require('./routes/captcha');
app.use('/api/captcha', captchaRoute.router || captchaRoute);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ratings', require('./routes/ratings'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'public', 'uploads')}`);
});