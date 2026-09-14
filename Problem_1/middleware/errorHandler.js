const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 2MB' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ errors });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  res.status(500).json({ error: 'Server error' });
};

module.exports = errorHandler;