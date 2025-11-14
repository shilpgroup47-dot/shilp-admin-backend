const blogService = require("../services/blogService");

/**
 * Create a new blog
 */
const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      points: req.body.points ? JSON.parse(req.body.points) : [],
    };

    // Handle uploaded images
    if (req.files) {
      const files = req.files;
      
      // Main image
      if (files.image && files.image[0]) {
        blogData.image = `/uploads/blogs/${req.body.url}/${files.image[0].filename}`;
      }

      // Points images
      if (blogData.points && blogData.points.length > 0) {
        blogData.points = blogData.points.map((point, index) => {
          const pointImageKey = `point_${index}_image`;
          if (files[pointImageKey] && files[pointImageKey][0]) {
            point.image = `/uploads/blogs/${req.body.url}/${files[pointImageKey][0].filename}`;
          }
          return point;
        });
      }
    }

    const blog = await blogService.createBlog(blogData);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create blog",
    });
  }
};

/**
 * Get all blogs
 */
const getAllBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    const blogs = await blogService.getAllBlogs(status);

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

/**
 * Get a single blog by ID
 */
const getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Blog not found",
    });
  }
};

/**
 * Get a blog by URL slug
 */
const getBlogByUrl = async (req, res) => {
  try {
    const blog = await blogService.getBlogByUrl(req.params.url);

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Blog not found",
    });
  }
};

/**
 * Update a blog
 */
const updateBlog = async (req, res) => {
  try {
    // Get existing blog first
    const existingBlog = await blogService.getBlogById(req.params.id);
    
    const updateData = {
      ...req.body,
      points: req.body.points ? JSON.parse(req.body.points) : undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Track old images to delete
    const oldImages = [];
    
    // Handle uploaded images
    if (req.files) {
      const files = req.files;

      // Main image - track old image for deletion
      if (files.image && files.image[0]) {
        if (existingBlog.image) {
          oldImages.push(existingBlog.image);
        }
        updateData.image = `/uploads/blogs/${existingBlog.url}/${files.image[0].filename}`;
      }

      // Points images - track old images for deletion
      if (updateData.points && updateData.points.length > 0) {
        updateData.points = updateData.points.map((point, index) => {
          const pointImageKey = `point_${index}_image`;
          
          // If new image is uploaded for this point, mark old one for deletion
          if (files[pointImageKey] && files[pointImageKey][0]) {
            // Check if existing blog has this point with an image
            if (existingBlog.points[index] && existingBlog.points[index].image) {
              oldImages.push(existingBlog.points[index].image);
            }
            point.image = `/uploads/blogs/${existingBlog.url}/${files[pointImageKey][0].filename}`;
          } else if (existingBlog.points[index]) {
            // Keep existing image if no new image uploaded
            point.image = existingBlog.points[index].image;
          }
          return point;
        });
      }
    }

    const blog = await blogService.updateBlog(req.params.id, updateData);

    // Delete old images after successful update
    if (oldImages.length > 0) {
      await blogService.deleteSpecificImages(oldImages);
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
};

/**
 * Delete a blog
 */
const deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUrl,
  updateBlog,
  deleteBlog,
};
