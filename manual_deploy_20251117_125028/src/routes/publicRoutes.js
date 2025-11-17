const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/banners', publicController.getAllBanners);

router.get('/projects', publicController.getAllProjects);
router.get('/projects/:slug', publicController.getProjectBySlug);

router.get('/blogs', publicController.getAllBlogs);
router.get('/blogs/:slug', publicController.getBlogBySlug);

router.get('/project-tree', publicController.getAllProjectTree);
router.get('/project-tree/stats', publicController.getProjectTreeStats);

module.exports = router;
