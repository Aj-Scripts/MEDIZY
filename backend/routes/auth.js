const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyCaptcha } = require('./captcha');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, captchaId, captchaText, gender, specialization, image } = req.body;
    
    // Log incoming request (safely)
    console.log('Register request:', {
      body: { 
        ...req.body, 
        password: '[HIDDEN]',
        name: req.body.name,
        specialization: req.body.specialization,
        image: req.body.image,
        role: req.body.role
      },
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[HIDDEN]' : undefined
      }
    });

    // Check for admin user creation
    const isAdminCreation = req.headers['x-admin-creation'] === 'true';
    const authToken = req.headers.authorization?.split(' ')[1];

    // Verify admin token if this is an admin creation
    if (isAdminCreation) {
      if (!authToken) {
        return res.status(401).json({ message: 'Admin token required' });
      }
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'secretkey');
        if (decoded.role !== 'admin') {
          return res.status(403).json({ message: 'Admin privileges required' });
        }
      } catch (err) {
        return res.status(401).json({ message: 'Invalid admin token' });
      }
    }
    
    // Only require captcha for regular user/patient registration
    const isCaptchaRequired = !isAdminCreation && (!role || role === 'patient');
    
    if (isCaptchaRequired) {
      if (!captchaId || !captchaText) {
        return res.status(400).json({ message: 'Captcha required' });
      }
      if (!verifyCaptcha(captchaId, captchaText)) {
        return res.status(400).json({ message: 'Invalid captcha' });
      }
    }
    
    // Admin token verification already done above

    // Validation with specific messages
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields,
        receivedData: { name, email, hasPassword: !!password, role }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format',
        receivedEmail: email
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters',
        passwordLength: password.length
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with all fields
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient', // Default to patient if no role specified
      gender: gender || 'unspecified', // Default gender if not specified
      specialization: specialization || '', // Include specialization
      image: image || '' // Include image URL
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    // Return user data without password
    // Get user object without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Send more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: err.message 
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token', 
        error: err.message 
      });
    } else {
      res.status(500).json({ 
        message: 'Registration failed', 
        error: err.message,
        details: err.stack
      });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, captchaId, captchaText } = req.body;

    // Validate captcha
    if (!captchaId || !captchaText) {
      return res.status(400).json({ message: 'Captcha required' });
    }
    if (!verifyCaptcha(captchaId, captchaText)) {
      return res.status(400).json({ message: 'Invalid captcha' });
    }

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and handle errors
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ 
        message: 'Error finding user', 
        error: err.message 
      });
    }

    // Check password with more detailed error handling
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({ 
        message: 'Error verifying credentials', 
        error: err.message 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    // Get user object without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Login failed', 
      error: err.message 
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;