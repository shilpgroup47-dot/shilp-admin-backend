const Project = require('../models/Project');

class ProjectRepository {
  /**
   * Create a new project
   * @param {Object} projectData - Project data to create
   * @returns {Promise<Object>} Created project
   */
  async create(projectData, options = {}) {
    try {
      const project = new Project(projectData);
      // Allow caller to skip validation for draft saves
      const validateBeforeSave = options.validateBeforeSave === false ? false : true;
      return await project.save({ validateBeforeSave });
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Find project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object|null>} Project or null
   */
  async findById(id) {
    try {
      return await Project.findById(id);
    } catch (error) {
      throw new Error(`Failed to find project by ID: ${error.message}`);
    }
  }

  /**
   * Find project by slug
   * @param {string} slug - Project slug
   * @returns {Promise<Object|null>} Project or null
   */
  async findBySlug(slug) {
    try {
      return await Project.findOne({ slug, isActive: true });
    } catch (error) {
      throw new Error(`Failed to find project by slug: ${error.message}`);
    }
  }

  /**
   * Get all active projects with pagination
   * @param {Object} options - Query options (page, limit, sort)
   * @returns {Promise<Object>} Projects with pagination info
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        filter = {}
      } = options;

      const skip = (page - 1) * limit;
      // Admin panel: Show all projects (active and inactive)
      const query = { ...filter };

      const [projects, total] = await Promise.all([
        Project.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Project.countDocuments(query)
      ]);

      return {
        projects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  /**
   * Find projects by state
   * @param {string} state - Project state ('on-going' or 'completed')
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Projects
   */
  async findByState(state, options = {}) {
    try {
      const { limit = 10, sort = { createdAt: -1 } } = options;
      
      return await Project.findByState(state)
        .limit(parseInt(limit))
        .sort(sort)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find projects by state: ${error.message}`);
    }
  }

  /**
   * Find projects by type
   * @param {string} type - Project type ('residential', 'commercial', 'plot')
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Projects
   */
  async findByType(type, options = {}) {
    try {
      const { limit = 10, sort = { createdAt: -1 } } = options;
      
      return await Project.findByType(type)
        .limit(parseInt(limit))
        .sort(sort)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find projects by type: ${error.message}`);
    }
  }

  /**
   * Update project by ID
   * @param {string} id - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated project
   */
  async update(id, updateData, options = {}) {
    try {
      const runValidators = options.runValidators === false ? false : true;
      return await Project.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators }
      );
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Soft delete project (set isActive to false)
   * @param {string} id - Project ID
   * @returns {Promise<Object|null>} Updated project
   */
  async softDelete(id) {
    try {
      return await Project.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Hard delete project
   * @param {string} id - Project ID
   * @returns {Promise<Object|null>} Deleted project
   */
  async delete(id) {
    try {
      return await Project.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Check if slug exists
   * @param {string} slug - Project slug
   * @param {string} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null) {
    try {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const project = await Project.findOne(query);
      return !!project;
    } catch (error) {
      throw new Error(`Failed to check slug existence: ${error.message}`);
    }
  }

  /**
   * Search projects
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Projects
   */
  async search(searchTerm, options = {}) {
    try {
      const { limit = 10, sort = { createdAt: -1 } } = options;
      
      const searchRegex = new RegExp(searchTerm, 'i');
      
      return await Project.find({
        isActive: true,
        $or: [
          { projectTitle: searchRegex },
          { shortAddress: searchRegex },
          { slug: searchRegex },
          { 'aboutUsDescriptions.text': searchRegex }
        ]
      })
      .limit(parseInt(limit))
      .sort(sort)
      .lean();
    } catch (error) {
      throw new Error(`Failed to search projects: ${error.message}`);
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Project statistics
   */
  async getStats() {
    try {
      const [total, onGoing, completed, residential, commercial, plot] = await Promise.all([
        Project.countDocuments({ isActive: true }),
        Project.countDocuments({ isActive: true, projectState: 'on-going' }),
        Project.countDocuments({ isActive: true, projectState: 'completed' }),
        Project.countDocuments({ isActive: true, cardProjectType: 'residential' }),
        Project.countDocuments({ isActive: true, cardProjectType: 'commercial' }),
        Project.countDocuments({ isActive: true, cardProjectType: 'plot' })
      ]);

      return {
        total,
        byState: { onGoing, completed },
        byType: { residential, commercial, plot }
      };
    } catch (error) {
      throw new Error(`Failed to get project statistics: ${error.message}`);
    }
  }
}

module.exports = new ProjectRepository();