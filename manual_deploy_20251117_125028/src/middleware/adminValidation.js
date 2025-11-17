const { body } = require('express-validator');

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

// Create admin validation
const validateCreateAdmin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  
  body('role')
    .optional()
    .isIn(['super-admin', 'admin', 'moderator'])
    .withMessage('Invalid role')
];

// Update profile validation
const validateUpdateProfile = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('fullName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters')
];

// Update role validation
const validateUpdateRole = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['super-admin', 'admin', 'moderator'])
    .withMessage('Invalid role'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

// Update active status validation
const validateUpdateActiveStatus = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

module.exports = {
  validateLogin,
  validateCreateAdmin,
  validateUpdateProfile,
  validateUpdateRole,
  validateUpdateActiveStatus
};