const jobOpeningRepository = require('../repositories/jobOpeningRepository');

class JobOpeningController {
  
  // Create a new job opening
  async createJobOpening(req, res) {
    try {
      const jobData = req.body;
      
      // Validate required fields
      if (!jobData.title) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }

      const newJob = await jobOpeningRepository.create(jobData);
      
      res.status(201).json({
        success: true,
        message: 'Job opening created successfully',
        data: newJob
      });
    } catch (error) {
      console.error('Error creating job opening:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all job openings (admin)
  async getAllJobOpenings(req, res) {
    try {
      const { 
        isActive, 
        department, 
        employmentType, 
        search, 
        page = 1, 
        limit = 10 
      } = req.query;

      const filters = {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(department && { department }),
        ...(employmentType && { employmentType }),
        ...(search && { search }),
        ...(limit && { limit: parseInt(limit) }),
        ...(page && { offset: (parseInt(page) - 1) * parseInt(limit) })
      };

      const jobOpenings = await jobOpeningRepository.getAll(filters);
      const totalCount = await jobOpeningRepository.getCount(filters);

      res.json({
        success: true,
        data: {
          jobOpenings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: parseInt(page) * parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching job openings:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active job openings (public API)
  async getActiveJobOpenings(req, res) {
    try {
      const activeJobs = await jobOpeningRepository.getActiveJobs();
      
      res.json({
        success: true,
        data: activeJobs
      });
    } catch (error) {
      console.error('Error fetching active job openings:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get job opening by ID
  async getJobOpeningById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Job opening ID is required'
        });
      }

      const jobOpening = await jobOpeningRepository.getById(id);
      
      res.json({
        success: true,
        data: jobOpening
      });
    } catch (error) {
      console.error('Error fetching job opening:', error);
      if (error.message === 'Job opening not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Update job opening
  async updateJobOpening(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Job opening ID is required'
        });
      }

      const updatedJob = await jobOpeningRepository.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Job opening updated successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Error updating job opening:', error);
      if (error.message === 'Job opening not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Delete job opening
  async deleteJobOpening(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Job opening ID is required'
        });
      }

      await jobOpeningRepository.delete(id);
      
      res.json({
        success: true,
        message: 'Job opening deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job opening:', error);
      if (error.message === 'Job opening not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Toggle job opening status
  async toggleJobStatus(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Job opening ID is required'
        });
      }

      const updatedJob = await jobOpeningRepository.toggleStatus(id);
      
      res.json({
        success: true,
        message: `Job opening ${updatedJob.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedJob
      });
    } catch (error) {
      console.error('Error toggling job status:', error);
      if (error.message === 'Job opening not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Update sort order
  async updateSortOrder(req, res) {
    try {
      const { jobOrderUpdates } = req.body;
      
      if (!jobOrderUpdates || !Array.isArray(jobOrderUpdates)) {
        return res.status(400).json({
          success: false,
          message: 'Job order updates array is required'
        });
      }

      await jobOpeningRepository.updateSortOrder(jobOrderUpdates);
      
      res.json({
        success: true,
        message: 'Sort order updated successfully'
      });
    } catch (error) {
      console.error('Error updating sort order:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get job statistics
  async getJobStatistics(req, res) {
    try {
      const totalJobs = await jobOpeningRepository.getCount();
      const activeJobs = await jobOpeningRepository.getCount({ isActive: true });
      const inactiveJobs = await jobOpeningRepository.getCount({ isActive: false });

      res.json({
        success: true,
        data: {
          totalJobs,
          activeJobs,
          inactiveJobs
        }
      });
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new JobOpeningController();