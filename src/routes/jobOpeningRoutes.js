const express = require('express');
const router = express.Router();
const jobOpeningController = require('../controllers/jobOpeningController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes (no authentication required)
router.get('/public/active', jobOpeningController.getActiveJobOpenings);
router.get('/public/:id', jobOpeningController.getJobOpeningById);

// Admin routes (temporarily no authentication for testing)
// Job opening CRUD operations
router.post('/', jobOpeningController.createJobOpening);
router.get('/', jobOpeningController.getAllJobOpenings);
router.get('/statistics', jobOpeningController.getJobStatistics);
router.get('/:id', jobOpeningController.getJobOpeningById);
router.put('/:id', jobOpeningController.updateJobOpening);
router.delete('/:id', jobOpeningController.deleteJobOpening);

// Job opening status and ordering
router.patch('/:id/toggle-status', jobOpeningController.toggleJobStatus);
router.put('/sort-order', jobOpeningController.updateSortOrder);

module.exports = router;