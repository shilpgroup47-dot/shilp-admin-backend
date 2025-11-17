const bannerService = require('../services/bannerService');
const projectService = require('../services/projectService');
const blogService = require('../services/blogService');
const projectTreeService = require('../services/projectTreeService');

const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerService.getBanners();
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 100 } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      filter: filters,
      sort: { createdAt: -1 }
    };

    const result = await projectService.getAllProjects(options);
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await projectService.getProjectBySlug(slug);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    // For public API, we only want published blogs
    const blogs = await blogService.getAllBlogs('published');
    
    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // Use getBlogByUrl since the service function is getBlogByUrl, not getBlogBySlug
    const blog = await blogService.getBlogByUrl(slug);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
};

const getAllProjectTree = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (search) filters.search = search;

    const projectTree = await projectTreeService.getAllProjectTrees(filters);
    
    res.status(200).json({
      success: true,
      data: projectTree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tree',
      error: error.message
    });
  }
};

const getProjectTreeStats = async (req, res) => {
  try {
    const stats = await projectTreeService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tree stats',
      error: error.message
    });
  }
};

module.exports = {
  getAllBanners,
  getAllProjects,
  getProjectBySlug,
  getAllBlogs,
  getBlogBySlug,
  getAllProjectTree,
  getProjectTreeStats
};
