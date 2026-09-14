require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' MongoDB Connected Successfully');
    console.log(' Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error(' MongoDB Connection Error:', err.message);
  });

// Helmet with CSP disabled for development
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files - Serve uploads and public folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/auth', limiter);

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/', require('./routes/viewRoutes'));

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: ' Server is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(' Server Error:', err.message);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Test API: http://localhost:${PORT}/test`);
});