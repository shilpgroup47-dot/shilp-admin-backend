const { body, param, query } = require('express-validator');
const projectRepository = require('../repositories/projectRepository');

const projectValidation = {
  // Simplified validation matching client-side validation
  createProject: [
    // Basic required fields
    body('projectTitle')
      .trim()
      .notEmpty()
      .withMessage('Project title is required'),

    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required')
      .custom(async (value) => {
        if (!value || value.trim() === '') {
          throw new Error('Slug cannot be empty');
        }
        const exists = await projectRepository.slugExists(value.trim());
        if (exists) {
          throw new Error(`Project with slug '${value}' already exists`);
        }
        return true;
      }),

    body('shortAddress')
      .trim()
      .notEmpty()
      .withMessage('Short address is required'),

    body('projectType')
      .isIn(['residential', 'commercial', 'plot'])
      .withMessage('Project type must be residential, commercial, or plot'),

    body('projectState')
      .isIn(['on-going', 'completed'])
      .withMessage('Project state must be on-going or completed'),

    body('projectStatusPercentage')
      .optional()
      .isNumeric()
      .withMessage('Project status percentage must be a number'),

    // About Us Description 1 is required, others are optional
    body('description1')
      .trim()
      .notEmpty()
      .withMessage('Description 1 is required'),

    body('description2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description3')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description4')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // About Us Image Alt Text (optional)
    body('aboutUsAlt')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // Location fields (required)
    body('locationTitle')
      .trim()
      .notEmpty()
      .withMessage('Location title is required'),

    body('locationTitleText')
      .trim()
      .notEmpty()
      .withMessage('Location title text is required'),

    body('locationArea')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('mapIframeUrl')
      .trim()
      .notEmpty()
      .withMessage('Map iframe URL is required'),

    // Contact details (using defaults from client)
    body('number1')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('number2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('email1')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('email2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // Card details (required)
    body('cardLocation')
      .trim()
      .notEmpty()
      .withMessage('Card location is required'),

    body('cardAreaFt')
      .trim()
      .notEmpty()
      .withMessage('Card area (sq ft) is required'),

    body('cardProjectType')
      .optional()
      .isIn(['residential', 'commercial', 'plot'])
      .withMessage('Card project type must be residential, commercial, or plot'),

    body('cardHouse')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // Updated images title (required)
    body('updatedImagesTitle')
      .trim()
      .notEmpty()
      .withMessage('Updated images title is required'),

    // All other fields are optional
    body('youtubeUrl')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('reraNumber')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // JSON fields validation
    body('aboutUsDetail')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            throw new Error('About Us detail must be valid JSON');
          }
        }
        return true;
      }),

    body('floorPlans')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            throw new Error('Floor plans must be valid JSON');
          }
        }
        return true;
      }),

    body('projectImages')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            throw new Error('Project images must be valid JSON');
          }
        }
        return true;
      }),

    body('amenities')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            throw new Error('Amenities must be valid JSON');
          }
        }
        return true;
      }),

    body('updatedImages')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            throw new Error('Updated images must be valid JSON');
          }
        }
        return true;
      }),
  ],

  // Validation for updating a project
  updateProject: [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID'),

    body('projectTitle')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Project title is required'),

    body('slug')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Slug is required'),

    body('shortAddress')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Short address is required'),

    body('projectType')
      .optional()
      .isIn(['residential', 'commercial', 'plot'])
      .withMessage('Project type must be residential, commercial, or plot'),

    body('projectState')
      .optional()
      .isIn(['on-going', 'completed'])
      .withMessage('Project state must be on-going or completed'),

    body('projectStatusPercentage')
      .optional()
      .isNumeric()
      .withMessage('Project status percentage must be a number'),

    // About Us Description 1 is required if provided, others are optional
    body('description1')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description 1 is required when provided'),

    body('description2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description3')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description4')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // About Us Image Alt Text (optional)
    body('aboutUsAlt')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // Location fields (required if provided)
    body('locationTitle')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Location title is required when provided'),

    body('locationTitleText')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Location title text is required when provided'),

    body('locationArea')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('mapIframeUrl')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Map iframe URL is required when provided'),

    // Contact details (optional)
    body('number1')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('number2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('email1')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('email2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('cardAreaFt')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('cardLocation')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('cardProjectType')
      .optional()
      .isIn(['residential', 'commercial', 'plot'])
      .withMessage('Card project type must be residential, commercial, or plot'),

    body('cardHouse')
      .optional()
      .isIn(['Ready to Move', 'Sample House Ready'])
      .withMessage('Card house status must be Ready to Move or Sample House Ready'),

    body('youtubeUrl')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('updatedImagesTitle')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('reraNumber')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),

    body('description2')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description3')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('description4')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    // About Us Image Alt Text (optional)
    body('aboutUsAlt')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('About Us image alt text must be between 1 and 200 characters'),

    // Optional fields
    body('mapLocation')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Map location must be between 5 and 500 characters'),

    body('highlights')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Highlights must be between 10 and 1000 characters'),

    body('priority')
      .optional({ nullable: true })
      .isInt({ min: 1, max: 100 })
      .withMessage('Priority must be a number between 1 and 100'),

    body('lat')
      .optional({ nullable: true })
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be a valid coordinate between -90 and 90'),

    body('lng')
      .optional({ nullable: true })
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be a valid coordinate between -180 and 180'),

    // YouTube URL and RERA Number - optional fields
    body('youtubeUrl')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),

    body('reraNumber')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),
  ],

  // Validation for getting project by ID
  getProject: [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID')
  ],

  // Validation for getting project by slug
  getProjectBySlug: [
    param('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
  ],

  // Validation for deleting a project
  deleteProject: [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID')
  ],

  // Validation for getting all projects with filtering
  getAllProjects: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('projectType')
      .optional()
      .isIn(['Residential', 'Commercial'])
      .withMessage('Project type must be Residential or Commercial'),

    query('houseStatus')
      .optional()
      .isIn(['Under Construction', 'Completed', 'Upcoming'])
      .withMessage('House status must be Under Construction, Completed, or Upcoming'),

    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),

    query('sort')
      .optional()
      .isIn(['createdAt', 'projectTitle', 'priority', 'houseStatus'])
      .withMessage('Sort field must be one of: createdAt, projectTitle, priority, houseStatus'),

    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
  ]
};

module.exports = projectValidation;