const blogRepository = require("../repositories/blogRepository");
const fs = require("fs").promises;
const path = require("path");

/**
 * Create a new blog
 */
const createBlog = async (blogData) => {
  // Check if URL slug already exists
  const urlExists = await blogRepository.checkUrlExists(blogData.url);
  if (urlExists) {
    throw new Error("Blog URL slug already exists");
  }

  return await blogRepository.createBlog(blogData);
};

/**
 * Get all blogs
 */
const getAllBlogs = async (status = null) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  return await blogRepository.getAllBlogs(filter);
};

/**
 * Get a single blog by ID
 */
const getBlogById = async (blogId) => {
  const blog = await blogRepository.getBlogById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }
  return blog;
};

/**
 * Get a blog by URL slug
 */
const getBlogByUrl = async (url) => {
  const blog = await blogRepository.getBlogByUrl(url);
  if (!blog) {
    throw new Error("Blog not found");
  }
  return blog;
};

/**
 * Update a blog
 */
const updateBlog = async (blogId, updateData) => {
  // Check if blog exists
  const existingBlog = await blogRepository.getBlogById(blogId);
  if (!existingBlog) {
    throw new Error("Blog not found");
  }

  // If URL is being updated, check if new URL already exists
  if (updateData.url && updateData.url !== existingBlog.url) {
    const urlExists = await blogRepository.checkUrlExists(
      updateData.url,
      blogId
    );
    if (urlExists) {
      throw new Error("Blog URL slug already exists");
    }
  }

  return await blogRepository.updateBlog(blogId, updateData);
};

/**
 * Delete a blog and its associated images folder
 */
const deleteBlog = async (blogId) => {
  const blog = await blogRepository.getBlogById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  console.log(`📝 Deleting blog: ${blog.title || blogId}`);

  // First delete from database
  await blogRepository.deleteBlog(blogId);

  // Then delete the blog folder with all images
  const blogFolder = path.join(
    __dirname,
    "../../uploads/blogs",
    blog.url
  );

  try {
    console.log(`🗂️ Deleting blog folder: ${blogFolder}`);
    await fs.rm(blogFolder, { recursive: true, force: true });
    console.log(`✅ Successfully deleted blog folder: ${blog.url}`);
  } catch (error) {
    console.error(`❌ Error deleting blog folder: ${error.message}`);
    // Don't throw error if folder deletion fails
    // Blog is already deleted from database
  }

  console.log(`✅ Successfully deleted blog: ${blog.title || blogId}`);
  return { message: "Blog and all images deleted successfully" };
};

/**
 * Delete old images when updating a blog
 */
const deleteOldImages = async (blogUrl, newImages) => {
  const blogFolder = path.join(__dirname, "../../uploads/blogs", blogUrl);

  try {
    const files = await fs.readdir(blogFolder);
    
    // Get list of new image filenames
    const newImageNames = newImages.map(img => path.basename(img));
    
    // Delete files that are not in the new images list
    for (const file of files) {
      if (!newImageNames.includes(file)) {
        await fs.unlink(path.join(blogFolder, file));
      }
    }
  } catch (error) {
    console.error(`Error deleting old images: ${error.message}`);
  }
};

/**
 * Delete specific images from the filesystem
 */
const deleteSpecificImages = async (imagePaths) => {
  for (const imagePath of imagePaths) {
    try {
      const fullPath = path.join(__dirname, "../..", imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`Error deleting image ${imagePath}: ${error.message}`);
    }
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUrl,
  updateBlog,
  deleteBlog,
  deleteOldImages,
  deleteSpecificImages,
};
