const ProjectTree = require('../models/ProjectTree');

class ProjectTreeRepository {
  // Get all project tree items with optional filters and search
  async findAll(filters = {}, searchTerm = '') {
    try {
      let query = {};

      // Apply filters
      if (filters.year) {
        query.year = Number(filters.year);
      }
      if (filters.typeofproject) {
        query.typeofproject = filters.typeofproject;
      }

      // Apply search term
      if (searchTerm) {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      return await ProjectTree.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get a single project tree item by ID
  async findById(id) {
    try {
      return await ProjectTree.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get a project tree item by number
  async findByNo(no) {
    try {
      return await ProjectTree.findOne({ no: Number(no) });
    } catch (error) {
      throw error;
    }
  }

  // Create a new project tree item
  async create(projectTreeData) {
    try {
      const projectTree = new ProjectTree(projectTreeData);
      return await projectTree.save();
    } catch (error) {
      throw error;
    }
  }

  // Update a project tree item
  async update(id, updateData) {
    try {
      return await ProjectTree.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete a project tree item
  async delete(id) {
    try {
      return await ProjectTree.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Get distinct years
  async getDistinctYears() {
    try {
      return await ProjectTree.distinct('year');
    } catch (error) {
      throw error;
    }
  }

  // Get count by type
  async getCountByType() {
    try {
      return await ProjectTree.aggregate([
        {
          $group: {
            _id: '$typeofproject',
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectTreeRepository();
