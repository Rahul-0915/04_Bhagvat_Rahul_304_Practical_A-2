const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.user = user;
    req.userId = user._id;
    req.isAdmin = user.role === 'admin';
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is author or admin
const isAuthorOrAdmin = async (req, res, next) => {
  try {
    const Post = require('../models/Post');
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.userId.toString() && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to modify this post' });
    }

    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { auth, isAdmin, isAuthorOrAdmin };