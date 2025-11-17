const mongoose = require("mongoose");

const pointChildSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const pointSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    child: [pointChildSchema],
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Blog description is required"],
      trim: true,
    },
    publish: {
      type: String,
      required: true,
      default: "By Shilp Group",
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: [true, "Blog URL slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, "Blog main image is required"],
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
    points: [pointSchema],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (url index is already created by unique: true)
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
