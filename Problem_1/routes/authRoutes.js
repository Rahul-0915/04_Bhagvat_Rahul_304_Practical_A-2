const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//  REGISTER - Password hash manually
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Register request received:', { name, email });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    //  Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(' Password hashed successfully');

    // Create user with hashed password
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    console.log(' User saved to database:', user._id);

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: ' User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(' Register Error:', error);
    console.error(' Error Stack:', error.stack);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

//  LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(' Login request received:', { email });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    //  Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: ' Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(' Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//  PROFILE
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.error(' Profile Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;