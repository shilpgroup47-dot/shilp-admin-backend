const projectTreeService = require('../services/projectTreeService');
const path = require('path');
const fs = require('fs');

// Get all project tree items
exports.getAllProjectTrees = async (req, res) => {
  try {
    const { year, typeofproject, search } = req.query;
    
    const filters = {};
    if (year) filters.year = year;
    if (typeofproject) filters.typeofproject = typeofproject;

    const projectTrees = await projectTreeService.getAllProjectTrees(filters, search || '');

    res.json({
      success: true,
      count: projectTrees.length,
      data: projectTrees
    });
  } catch (error) {
    console.error('❌ Error fetching project trees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project trees',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single project tree item
exports.getProjectTreeById = async (req, res) => {
  try {
    const { id } = req.params;
    const projectTree = await projectTreeService.getProjectTreeById(id);

    res.json({
      success: true,
      data: projectTree
    });
  } catch (error) {
    console.error('❌ Error fetching project tree:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new project tree item
exports.createProjectTree = async (req, res) => {
  try {
    const { no, year, title, location, typeofproject } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Validate required fields
    if (!no || !year || !title || !location || !typeofproject) {
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'All fields are required: no, year, title, location, typeofproject'
      });
    }

    // Validate typeofproject
    const validTypes = ['plot', 'commercial', 'residential'];
    if (!validTypes.includes(typeofproject)) {
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid project type. Must be: plot, commercial, or residential'
      });
    }

    // Create image URL path
    const imageUrl = `/uploads/projecttree/${file.filename}`;

    // Prepare file metadata
    const fileMetadata = {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    };

    // Create project tree item
    const projectTreeData = {
      no: Number(no),
      year: Number(year),
      title,
      location,
      image: imageUrl,
      imageMetadata: fileMetadata,
      typeofproject
    };

    const projectTree = await projectTreeService.createProjectTree(projectTreeData);

    res.status(201).json({
      success: true,
      message: 'Project tree item created successfully',
      data: projectTree
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Error creating project tree:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a project tree item
exports.updateProjectTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { no, year, title, location, typeofproject } = req.body;
    const file = req.file;

    const updateData = {};
    
    if (no !== undefined) updateData.no = Number(no);
    if (year !== undefined) updateData.year = Number(year);
    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (typeofproject !== undefined) {
      const validTypes = ['plot', 'commercial', 'residential'];
      if (!validTypes.includes(typeofproject)) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          success: false,
          error: 'Invalid project type. Must be: plot, commercial, or residential'
        });
      }
      updateData.typeofproject = typeofproject;
    }

    let imageUrl = null;
    let fileMetadata = null;

    if (file) {
      imageUrl = `/uploads/projecttree/${file.filename}`;
      fileMetadata = {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date()
      };
    }

    const updatedProjectTree = await projectTreeService.updateProjectTree(
      id,
      updateData,
      imageUrl,
      fileMetadata
    );

    res.json({
      success: true,
      message: 'Project tree item updated successfully',
      data: updatedProjectTree
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Error updating project tree:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a project tree item
exports.deleteProjectTree = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProjectTree = await projectTreeService.deleteProjectTree(id);

    res.json({
      success: true,
      message: 'Project tree item deleted successfully',
      data: deletedProjectTree
    });
  } catch (error) {
    console.error('❌ Error deleting project tree:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await projectTreeService.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
