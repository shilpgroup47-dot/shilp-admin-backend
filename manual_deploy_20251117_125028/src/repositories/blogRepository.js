const Blog = require("../models/Blog");

/**
 * Create a new blog
 */
const createBlog = async (blogData) => {
  const blog = new Blog(blogData);
  return await blog.save();
};

/**
 * Get all blogs with optional filtering
 */
const getAllBlogs = async (filter = {}) => {
  return await Blog.find(filter).sort({ createdAt: -1 });
};

/**
 * Get a single blog by ID
 */
const getBlogById = async (blogId) => {
  return await Blog.findById(blogId);
};

/**
 * Get a blog by URL slug
 */
const getBlogByUrl = async (url) => {
  return await Blog.findOne({ url });
};

/**
 * Update a blog by ID
 */
const updateBlog = async (blogId, updateData) => {
  return await Blog.findByIdAndUpdate(blogId, updateData, {
    new: true,
    runValidators: true,
  });
};

/**
 * Delete a blog by ID
 */
const deleteBlog = async (blogId) => {
  return await Blog.findByIdAndDelete(blogId);
};

/**
 * Check if URL slug already exists (for validation)
 */
const checkUrlExists = async (url, excludeId = null) => {
  const query = { url };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const blog = await Blog.findOne(query);
  return !!blog;
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUrl,
  updateBlog,
  deleteBlog,
  checkUrlExists,
};
