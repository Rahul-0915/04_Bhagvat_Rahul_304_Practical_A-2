const { body, validationResult } = require('express-validator');

// Registration validation
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Post validation
const validatePost = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean')
];

// Validation result handler - THIS MUST BE A FUNCTION
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// EXPORT ALL FUNCTIONS
module.exports = {
  validateRegister: validateRegister,
  validateLogin: validateLogin,
  validatePost: validatePost,
  handleValidationErrors: handleValidationErrors
};