const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// Register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Dashboard page
router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Published posts page
router.get('/posts', (req, res) => {
  res.render('posts');
});

module.exports = router;