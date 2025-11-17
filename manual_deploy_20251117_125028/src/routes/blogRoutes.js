const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const blogController = require("../controllers/blogController");
const { verifyToken } = require("../middleware/adminAuth");

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create dynamic folder based on blog URL slug
    const blogUrl = req.body.url || req.params.url || "temp";
    const uploadPath = path.join(__dirname, "../../uploads/blogs", blogUrl);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Define upload fields for blog with dynamic points
const uploadFields = [
  { name: "image", maxCount: 1 }, // Main blog image
];

// Add fields for up to 20 points (you can adjust this number)
for (let i = 0; i < 20; i++) {
  uploadFields.push({ name: `point_${i}_image`, maxCount: 1 });
}

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog
 * @access  Private (Admin only)
 */
router.post("/", verifyToken, upload.fields(uploadFields), blogController.createBlog);

/**
 * @route   GET /api/blogs
 * @desc    Get all blogs (with optional status filter)
 * @access  Private (Admin only)
 */
router.get("/", verifyToken, blogController.getAllBlogs);

/**
 * @route   GET /api/blogs/url/:url
 * @desc    Get a blog by URL slug
 * @access  Public (for frontend display)
 */
router.get("/url/:url", blogController.getBlogByUrl);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get a single blog by ID
 * @access  Private (Admin only)
 */
router.get("/:id", verifyToken, blogController.getBlogById);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog
 * @access  Private (Admin only)
 */
router.put("/:id", verifyToken, upload.fields(uploadFields), blogController.updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog
 * @access  Private (Admin only)
 */
router.delete("/:id", verifyToken, blogController.deleteBlog);

module.exports = router;
