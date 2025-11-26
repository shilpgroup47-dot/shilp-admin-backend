const projectService = require('../services/projectService');
const { validationResult } = require('express-validator');

class ProjectController {
  /**
   * Create a new project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createProject = async (req, res) => {
    const startTime = Date.now();
    
    try {
      // � SKIP LOGGING FOR SPEED - Only log errors
      
      // Quick validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          responseTime: Date.now() - startTime + 'ms'
        });
      }

      // 🚀 FAST PARSING - No logging
      const parsedData = this.parseFormData(req.body);
      
      // Quick slug generation
      parsedData.slug = await this.generateUniqueSlug(parsedData.projectTitle);
      
      // Fast number formatting
      if (parsedData.number1 && !parsedData.number1.startsWith('+91')) {
        parsedData.number1 = `+91${parsedData.number1}`;
      }
      if (parsedData.number2 && !parsedData.number2.startsWith('+91')) {
        parsedData.number2 = `+91${parsedData.number2}`;
      }

      // Check if this is a draft save (allows partial data)
      const isDraft = req.query && req.query.draft === 'true';

      // For drafts, ensure we have a projectTitle and slug (generate defaults if missing)
      if (isDraft) {
        if (!parsedData.projectTitle || !parsedData.projectTitle.trim()) {
          parsedData.projectTitle = `Draft ${Date.now()}`;
        }
        if (!parsedData.slug || !parsedData.slug.trim()) {
          parsedData.slug = this.generateSlug(parsedData.projectTitle);
        }
        // Provide sensible defaults for required fields so Mongoose validation does not fail
        if (!parsedData.projectState) parsedData.projectState = 'on-going';
        if (!parsedData.projectType) parsedData.projectType = 'residential';
        if (!parsedData.shortAddress) parsedData.shortAddress = 'Draft address';
        if (parsedData.projectStatusPercentage === undefined || parsedData.projectStatusPercentage === null) parsedData.projectStatusPercentage = 0;
        if (!parsedData.aboutUsDetail) parsedData.aboutUsDetail = {};
        if (!parsedData.aboutUsDetail.description1 || !parsedData.aboutUsDetail.description1.trim()) parsedData.aboutUsDetail.description1 = 'Draft description';
      }

      // Quick slug validation for non-draft requests
      if (!isDraft && !parsedData.slug?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required and cannot be empty',
          errors: [{ field: 'slug', message: 'Slug is required and cannot be empty' }]
        });
      }

      console.log('🔧 Server: Calling project service...');
      
      // Organize files by fieldname since upload.any() returns array
      const organizedFiles = {};
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (!organizedFiles[file.fieldname]) {
            organizedFiles[file.fieldname] = [];
          }
          organizedFiles[file.fieldname].push(file);
        });
        console.log('📁 Server: Organized files:', Object.keys(organizedFiles));
      }
      
      // Create project with uploaded files; pass draft flag so service can skip validation when needed
      const result = await projectService.createProject(parsedData, organizedFiles, isDraft);
      console.log('✅ Server: Project created successfully:', result);

      res.status(201).json(result);
    } catch (error) {
      console.error('Create project error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create project';
      let statusCode = 400;
      
      if (error.message.includes('duplicate key error')) {
        errorMessage = 'A project with this slug already exists. Please use a different project title or slug.';
        statusCode = 409; // Conflict
      } else if (error.message.includes('validation failed')) {
        errorMessage = 'Validation failed. Please check all required fields.';
        statusCode = 400; // Bad Request
      } else if (error.message.includes('Slug already exists')) {
        errorMessage = error.message;
        statusCode = 409; // Conflict
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Invalid data provided. Please check all fields.';
        statusCode = 400; // Bad Request
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get all projects with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProjects(req, res) {
    try {
      const {
        page = 1, 
        limit = 10, 
        sort = 'createdAt', 
        order = 'desc', 
        state,
        type,
        cardType,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 }
      };

      // Add filters
      const filter = {};
      if (state) filter.projectState = state;
      if (type) filter.projectType = type; // Main project type filter
      if (cardType) filter.cardProjectType = cardType; // Card display type filter
      
      options.filter = filter;      let result;
      if (search) {
        result = await projectService.searchProjects(search, options);
      } else {
        result = await projectService.getAllProjects(options);
      }

      res.json(result);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch projects',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get project by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID format'
        });
      }

      const result = await projectService.getProjectById(id);
      res.json(result);
    } catch (error) {
      console.error('Get project by ID error:', error);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch project',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get project by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required'
        });
      }

      const result = await projectService.getProjectBySlug(slug);
      res.json(result);
    } catch (error) {
      console.error('Get project by slug error:', error);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch project',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get projects by state
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectsByState(req, res) {
    try {
      const { state } = req.params;
      const { limit = 10 } = req.query;

      const options = {
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const result = await projectService.getProjectsByState(state, options);
      res.json(result);
    } catch (error) {
      console.error('Get projects by state error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch projects by state',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get projects by type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectsByType(req, res) {
    try {
      const { type } = req.params;
      const { limit = 10 } = req.query;

      const options = {
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const result = await projectService.getProjectsByType(type, options);
      res.json(result);
    } catch (error) {
      console.error('Get projects by type error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch projects by type',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Update project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateProject = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID format'
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Parse array data from form
      const updateData = this.parseFormData(req.body);
      // Detect draft flag for updates as well
      const isDraft = req.query && req.query.draft === 'true';
      
      console.log('🔧 Server: Update project files received:', req.files ? req.files.length : 'No files');
      
      // Debug: Log all received files with their fieldnames
      if (req.files && req.files.length > 0) {
        console.log('📋 Server: Update file details:');
        req.files.forEach((file, index) => {
          console.log(`  ${index}: ${file.fieldname} - ${file.originalname} (${file.size} bytes)`);
        });
      }

      // Organize files by fieldname since upload.any() returns array
      const organizedFiles = {};
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (!organizedFiles[file.fieldname]) {
            organizedFiles[file.fieldname] = [];
          }
          organizedFiles[file.fieldname].push(file);
        });
        console.log('📁 Server: Organized update files:', Object.keys(organizedFiles));
      }

      // Update project with uploaded files; pass draft flag to allow partial updates
      const result = await projectService.updateProject(id, updateData, organizedFiles, isDraft);

      res.json(result);
    } catch (error) {
      console.error('Update project error:', error);
      const statusCode = error.message === 'Project not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update project',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Delete project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const { permanent = true } = req.query; // Default to permanent delete
      
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID format'
        });
      }

      const result = await projectService.deleteProject(id, !permanent);
      res.json(result);
    } catch (error) {
      console.error('Delete project error:', error);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete project',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Toggle project active status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleProjectStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID format'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const result = await projectService.toggleProjectStatus(id, isActive);
      res.json(result);
    } catch (error) {
      console.error('Toggle status error:', error);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to toggle project status',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Search projects
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchProjects(req, res) {
    try {
      const { q: searchTerm, limit = 10 } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const options = {
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const result = await projectService.searchProjects(searchTerm, options);
      res.json(result);
    } catch (error) {
      console.error('Search projects error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to search projects',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get project statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectStats(req, res) {
    try {
      const result = await projectService.getProjectStats();
      res.json(result);
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch project statistics',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Parse form data arrays from multipart/form-data
   * @param {Object} body - Request body
   * @returns {Object} Parsed data
   */
  parseFormData(body) {
    const parsed = { ...body };

    // Parsing form data

    // Parse aboutUsDetail (4 individual description fields)
    parsed.aboutUsDetail = {
      description1: body.description1 || '',
      description2: body.description2 || '',
      description3: body.description3 || '',
      description4: body.description4 || '',
      image: { 
        url: body.aboutUsUrl || '',
        alt: body.aboutUsAlt || '' 
      }
    };

    // Parse bannerSection
    parsed.bannerSection = {
      desktopBannerImage: body.desktopBannerImage || '',
      mobileBannerImage: body.mobileBannerImage || '',
      alt: body.bannerAlt || ''
    };

    // Parse JSON arrays from form data
    try {
      // Parse floor plans JSON - handle update format
      if (body.floorPlans && typeof body.floorPlans === 'string') {
        const floorPlansData = JSON.parse(body.floorPlans);
        parsed.floorPlans = floorPlansData
          .filter(fp => fp.title && fp.title.trim()) // Only include floor plans with titles
          .map(fp => ({
            id: fp.id,
            title: fp.title || '',
            image: fp.image || '',
            alt: fp.alt || '',
            hasNewFile: fp.hasNewFile || false
            // Remove file, preview, and other client-side properties
          }));
      } else {
        parsed.floorPlans = []; // Default to empty array if not provided
      }

      // Parse project images JSON - handle update format
      if (body.projectImages && typeof body.projectImages === 'string') {
        const projectImagesData = JSON.parse(body.projectImages);
        parsed.projectImages = projectImagesData
          .filter(img => img.alt && img.alt.trim()) // Only include images with alt text
          .map(img => ({
            id: img.id,
            image: img.image || '',
            alt: img.alt || '',
            hasNewFile: img.hasNewFile || false
            // Remove file, preview, and other client-side properties
          }));
      } else {
        parsed.projectImages = []; // Default to empty array if not provided
      }

      // Parse amenities JSON - handle update format
      if (body.amenities && typeof body.amenities === 'string') {
        if (body.amenities === 'null') {
          parsed.amenities = []; // Use empty array instead of null
        } else {
          const amenitiesData = JSON.parse(body.amenities);
          // Remove temporary client-side properties and clean up data
          if (amenitiesData && Array.isArray(amenitiesData)) {
            parsed.amenities = amenitiesData
              .filter(amenity => amenity.title && amenity.title.trim()) // Only include amenities with titles
              .map(amenity => ({
                id: amenity.id,
                title: amenity.title || '',
                svgOrImage: amenity.svgOrImage || '',
                alt: amenity.alt || '',
                hasNewFile: amenity.hasNewFile || false
                // Remove file, preview, and other client-side properties
              }));
          } else {
            parsed.amenities = []; // Fallback to empty array
          }
        }
      } else {
        parsed.amenities = []; // Default to empty array if not provided
      }

      // Parse updated images JSON - handle update format
      if (body.updatedImages && typeof body.updatedImages === 'string') {
        const updatedImagesData = JSON.parse(body.updatedImages);
        parsed.updatedImages = updatedImagesData
          .filter(img => img.alt && img.alt.trim()) // Only include images with alt text
          .map(img => ({
            id: img.id,
            image: img.image || '',
            alt: img.alt || '',
            hasNewFile: img.hasNewFile || false
            // Remove file, preview, and other client-side properties
          }));
      } else {
        parsed.updatedImages = []; // Default to empty array if not provided
      }

    } catch (error) {
      console.error('Error parsing JSON arrays in form data:', error);
      throw new Error('Invalid JSON data in form submission');
    }

    // Debug logging for parsed arrays
    console.log('🔧 Server: Parsed arrays:');
    console.log('floorPlans:', parsed.floorPlans ? `${parsed.floorPlans.length} items` : 'null/undefined');
    console.log('projectImages:', parsed.projectImages ? `${parsed.projectImages.length} items` : 'null/undefined');
    console.log('amenities:', parsed.amenities ? `${parsed.amenities.length} items` : 'null/undefined');
    console.log('updatedImages:', parsed.updatedImages ? `${parsed.updatedImages.length} items` : 'null/undefined');

    // Legacy form-encoded array parsing (keep as fallback)
    // Parse floor plans array
    const floorPlanKeys = Object.keys(body).filter(key => key.startsWith('floorPlans['));
    if (floorPlanKeys.length > 0 && !parsed.floorPlans) {
      parsed.floorPlans = [];
      floorPlanKeys.forEach(key => {
        const match = key.match(/floorPlans\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!parsed.floorPlans[index]) {
            parsed.floorPlans[index] = {};
          }
          parsed.floorPlans[index][field] = body[key];
        }
      });
      // Parsed floorPlans
    }

    // Parse project images array
    const projectImageKeys = Object.keys(body).filter(key => key.startsWith('projectImages['));
    if (projectImageKeys.length > 0 && !parsed.projectImages) {
      parsed.projectImages = [];
      projectImageKeys.forEach(key => {
        const match = key.match(/projectImages\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!parsed.projectImages[index]) {
            parsed.projectImages[index] = {};
          }
          parsed.projectImages[index][field] = body[key];
        }
      });
      // Parsed projectImages
    }

    // Parse amenities array
    const amenityKeys = Object.keys(body).filter(key => key.startsWith('amenities['));
    if (amenityKeys.length > 0 && !parsed.amenities) {
      parsed.amenities = [];
      amenityKeys.forEach(key => {
        const match = key.match(/amenities\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!parsed.amenities[index]) {
            parsed.amenities[index] = {};
          }
          parsed.amenities[index][field] = body[key];
        }
      });
      // Parsed amenities
    }

    // Parse updated images array
    const updatedImageKeys = Object.keys(body).filter(key => key.startsWith('updatedImages['));
    if (updatedImageKeys.length > 0 && !parsed.updatedImages) {
      parsed.updatedImages = [];
      updatedImageKeys.forEach(key => {
        const match = key.match(/updatedImages\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!parsed.updatedImages[index]) {
            parsed.updatedImages[index] = {};
          }
          parsed.updatedImages[index][field] = body[key];
        }
      });
      // Parsed updatedImages
    }

    return parsed;
  }

  /**
   * Generate slug from project title
   * @param {string} title - Project title
   * @returns {string} Generated slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }

  /**
   * Generate unique slug by checking for conflicts
   * @param {string} title - Project title
   * @returns {string} Unique slug
   */
  async generateUniqueSlug(title) {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and append counter if needed
    while (await projectService.checkSlugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

module.exports = new ProjectController();