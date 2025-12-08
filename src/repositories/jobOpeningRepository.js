const JobOpening = require('../models/JobOpening');

class JobOpeningRepository {
  
  // Create a new job opening
  async create(jobData) {
    try {
      const jobOpening = new JobOpening(jobData);
      await jobOpening.save();
      return jobOpening;
    } catch (error) {
      throw new Error(`Error creating job opening: ${error.message}`);
    }
  }

  // Get all job openings with optional filtering
  async getAll(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      
      if (filters.department) {
        query.department = new RegExp(filters.department, 'i');
      }
      
      if (filters.employmentType) {
        query.employmentType = filters.employmentType;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { department: { $regex: filters.search, $options: 'i' } }
        ];
      }

      let mongoQuery = JobOpening.find(query)
        .sort({ sortOrder: 1, postedDate: -1 });

      if (filters.limit) {
        mongoQuery = mongoQuery.limit(parseInt(filters.limit));
      }

      if (filters.offset) {
        mongoQuery = mongoQuery.skip(parseInt(filters.offset));
      }

      const jobOpenings = await mongoQuery.exec();
      return jobOpenings;
    } catch (error) {
      throw new Error(`Error fetching job openings: ${error.message}`);
    }
  }

  // Get active job openings for public display
  async getActiveJobs() {
    try {
      const query = {
        isActive: true,
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: null },
          { applicationDeadline: { $gte: new Date() } }
        ]
      };

      const activeJobs = await JobOpening.find(query)
        .sort({ sortOrder: 1, postedDate: -1 })
        .exec();
      
      return activeJobs;
    } catch (error) {
      throw new Error(`Error fetching active job openings: ${error.message}`);
    }
  }

  // Get job opening by ID
  async getById(id) {
    try {
      const jobOpening = await JobOpening.findById(id);
      if (!jobOpening) {
        throw new Error('Job opening not found');
      }
      return jobOpening;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid job opening ID');
      }
      throw new Error(`Error fetching job opening: ${error.message}`);
    }
  }

  // Update job opening
  async update(id, updateData) {
    try {
      const jobOpening = await JobOpening.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!jobOpening) {
        throw new Error('Job opening not found');
      }
      
      return jobOpening;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid job opening ID');
      }
      throw new Error(`Error updating job opening: ${error.message}`);
    }
  }

  // Delete job opening
  async delete(id) {
    try {
      const jobOpening = await JobOpening.findByIdAndDelete(id);
      if (!jobOpening) {
        throw new Error('Job opening not found');
      }
      
      return { message: 'Job opening deleted successfully' };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid job opening ID');
      }
      throw new Error(`Error deleting job opening: ${error.message}`);
    }
  }

  // Update sort order
  async updateSortOrder(jobOrderUpdates) {
    try {
      const promises = jobOrderUpdates.map(({ id, sortOrder }) => 
        JobOpening.findByIdAndUpdate(id, { sortOrder })
      );
      
      await Promise.all(promises);
      return { message: 'Sort order updated successfully' };
    } catch (error) {
      throw new Error(`Error updating sort order: ${error.message}`);
    }
  }

  // Toggle job opening status
  async toggleStatus(id) {
    try {
      const jobOpening = await JobOpening.findById(id);
      if (!jobOpening) {
        throw new Error('Job opening not found');
      }
      
      jobOpening.isActive = !jobOpening.isActive;
      await jobOpening.save();
      
      return jobOpening;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid job opening ID');
      }
      throw new Error(`Error toggling job opening status: ${error.message}`);
    }
  }

  // Get count of job openings
  async getCount(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      
      if (filters.department) {
        query.department = new RegExp(filters.department, 'i');
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { department: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const count = await JobOpening.countDocuments(query);
      return count;
    } catch (error) {
      throw new Error(`Error counting job openings: ${error.message}`);
    }
  }
}

module.exports = new JobOpeningRepository();