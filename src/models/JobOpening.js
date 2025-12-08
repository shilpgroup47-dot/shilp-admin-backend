const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  experience: {
    type: String,
    required: true,
    default: '0+ Years Experience'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'job_openings'
});

// Index for better query performance
jobOpeningSchema.index({ isActive: 1, sortOrder: 1, postedDate: -1 });
jobOpeningSchema.index({ title: 'text', description: 'text', department: 'text' });

module.exports = mongoose.model('JobOpening', jobOpeningSchema);