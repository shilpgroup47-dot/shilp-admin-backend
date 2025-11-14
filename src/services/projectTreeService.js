const projectTreeRepository = require('../repositories/projectTreeRepository');
const path = require('path');
const fs = require('fs');

class ProjectTreeService {
  // Get all project tree items with filters and search
  async getAllProjectTrees(filters = {}, searchTerm = '') {
    try {
      return await projectTreeRepository.findAll(filters, searchTerm);
    } catch (error) {
      throw new Error(`Failed to fetch project trees: ${error.message}`);
    }
  }

  // Get a single project tree item
  async getProjectTreeById(id) {
    try {
      const projectTree = await projectTreeRepository.findById(id);
      if (!projectTree) {
        throw new Error('Project tree item not found');
      }
      return projectTree;
    } catch (error) {
      throw error;
    }
  }

  // Create a new project tree item
  async createProjectTree(projectTreeData) {
    try {
      // Check if number already exists
      const existingItem = await projectTreeRepository.findByNo(projectTreeData.no);
      if (existingItem) {
        throw new Error(`Project tree item with number ${projectTreeData.no} already exists`);
      }

      return await projectTreeRepository.create(projectTreeData);
    } catch (error) {
      throw error;
    }
  }

  // Update a project tree item
  async updateProjectTree(id, updateData, newImagePath = null, newImageMetadata = null) {
    try {
      const existingItem = await projectTreeRepository.findById(id);
      if (!existingItem) {
        throw new Error('Project tree item not found');
      }

      // If updating with a new image, delete the old one
      if (newImagePath && existingItem.image) {
        this.deleteImageFile(existingItem.image);
      }

      // Prepare update data
      const dataToUpdate = { ...updateData };
      if (newImagePath) {
        dataToUpdate.image = newImagePath;
        dataToUpdate.imageMetadata = newImageMetadata;
      }

      return await projectTreeRepository.update(id, dataToUpdate);
    } catch (error) {
      throw error;
    }
  }

  // Delete a project tree item
  async deleteProjectTree(id) {
    try {
      const projectTree = await projectTreeRepository.findById(id);
      if (!projectTree) {
        throw new Error('Project tree item not found');
      }

      console.log(`🗂️ Deleting project tree item: ${projectTree.title || id}`);

      // Delete the associated image file
      if (projectTree.image) {
        console.log(`🖼️ Deleting associated image: ${projectTree.image}`);
        this.deleteImageFile(projectTree.image);
      }

      const result = await projectTreeRepository.delete(id);
      console.log(`✅ Successfully deleted project tree item: ${projectTree.title || id}`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting project tree item: ${error.message}`);
      throw error;
    }
  }

  // Helper method to delete image file
  deleteImageFile(imagePath) {
    try {
      if (!imagePath) {
        console.log('📝 No image path provided for deletion');
        return;
      }

      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      const fullPath = path.join(process.cwd(), cleanPath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Successfully deleted image file: ${imagePath}`);
      } else {
        console.log(`📝 Image file not found (already deleted): ${imagePath}`);
      }
    } catch (error) {
      console.error(`❌ Error deleting image file ${imagePath}:`, error.message);
      // Don't throw error, just log it - continue with deletion process
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const years = await projectTreeRepository.getDistinctYears();
      const typeCounts = await projectTreeRepository.getCountByType();
      
      return {
        totalYears: years.length,
        years: years.sort((a, b) => b - a),
        typeBreakdown: typeCounts
      };
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }
}

module.exports = new ProjectTreeService();
