const mongoose = require('mongoose');

const projectTreeSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: [true, 'Number is required'],
    unique: true,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be at least 1990'],
    max: [2100, 'Year cannot be more than 2100']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true
  },
  imageMetadata: {
    uploadedAt: { type: Date, default: Date.now },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    size: { type: Number, default: 0 }
  },
  typeofproject: {
    type: String,
    required: [true, 'Type of project is required'],
    enum: {
      values: ['plot', 'commercial', 'residential'],
      message: '{VALUE} is not a valid project type'
    }
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Index for faster queries (no index is already created by unique: true)
projectTreeSchema.index({ year: -1 });
projectTreeSchema.index({ typeofproject: 1 });

module.exports = mongoose.model('ProjectTree', projectTreeSchema);
