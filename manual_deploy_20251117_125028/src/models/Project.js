const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Project title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot be more than 100 characters']
  },
  brochure: {
    type: String,
    trim: true
  },
  projectState: {
    type: String,
    enum: ['on-going', 'completed'],
    required: [true, 'Project state is required']
  },
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'plot'],
    required: [true, 'Project type is required']
  },
  shortAddress: {
    type: String,
    required: [true, 'Short address is required'],
    trim: true,
    maxlength: [300, 'Short address cannot be more than 300 characters']
  },
  projectStatusPercentage: {
    type: Number,
    required: [true, 'Project status percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot be more than 100']
  },
  
  // About Us Section - Combined Detail
  aboutUsDetail: {
    description1: {
      type: String,
      trim: true,
      required: [true, 'At least one description is required'],
      default: ''
    },
    description2: {
      type: String,
      trim: true,
      default: ''
    },
    description3: {
      type: String,
      trim: true,
      default: ''
    },
    description4: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      url: {
        type: String,
        trim: true
      },
      alt: {
        type: String,
        trim: true,
        default: ''
      }
    }
  },

  // Banner Section
  bannerSection: {
    desktopBannerImage: {
      type: String,
      trim: true,
      default: ''
    },
    mobileBannerImage: {
      type: String,
      trim: true,
      default: ''
    },
    alt: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Floor Plans
  floorPlans: [{
    title: {
      type: String,
      required: [true, 'Floor plan title is required'],
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  // Project Images (Max 5)
  projectImages: [{
    image: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  // Amenities
  amenities: [{
    title: {
      type: String,
      required: [true, 'Amenity title is required'],
      trim: true
    },
    svgOrImage: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  // Media
  youtubeUrl: {
    type: String,
    trim: true
  },
  
  // Updated Images Section (Max 3)
  updatedImagesTitle: {
    type: String,
    trim: true
  },
  updatedImages: [{
    image: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  // Location Section
  locationTitle: {
    type: String,
    trim: true
  },
  locationTitleText: {
    type: String,
    trim: true
  },
  locationArea: {
    type: String,
    trim: true
  },
  number1: {
    type: String,
    trim: true
  },
  number2: {
    type: String,
    trim: true
  },
  email1: {
    type: String,
    trim: true,
    lowercase: true
  },
  email2: {
    type: String,
    trim: true,
    lowercase: true
  },
  mapIframeUrl: {
    type: String,
    trim: true
  },
  
  // Card Detail
  cardImage: {
    type: String,
    trim: true
  },
  cardLocation: {
    type: String,
    trim: true
  },
  cardAreaFt: {
    type: String,
    trim: true
  },
  cardProjectType: {
    type: String,
    enum: ['residential', 'commercial', 'plot'],
    required: [true, 'Card project type is required']
  },
  cardHouse: {
    type: String,
    enum: ['Ready to Move', 'Sample House Ready'],
    required: [true, 'Card house status is required']
  },
  
  // RERA Details
  reraNumber: {
    type: String,
    trim: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // SEO and Meta
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance (slug already has unique index)
projectSchema.index({ projectState: 1 });
projectSchema.index({ cardProjectType: 1 });
projectSchema.index({ isActive: 1 });

// Pre-save middleware to update the updatedAt field
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full project URL
projectSchema.virtual('fullUrl').get(function() {
  return `/projects/${this.slug}`;
});

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find by project state
projectSchema.statics.findByState = function(state) {
  return this.find({ projectState: state, isActive: true }).sort({ createdAt: -1 });
};

// 🚀 PERFORMANCE OPTIMIZATIONS

// Indexes for faster queries
projectSchema.index({ projectType: 1, isActive: 1 }); // Compound index for type filtering
projectSchema.index({ projectState: 1, isActive: 1 }); // Compound index for state filtering
projectSchema.index({ createdAt: -1 }); // Index for sorting by creation date
projectSchema.index({ updatedAt: -1 }); // Index for sorting by update date
projectSchema.index({ cardProjectType: 1, isActive: 1, createdAt: -1 }); // Compound index for findByType

// Set schema options for better performance
projectSchema.set('autoIndex', false); // Disable auto-indexing in production
projectSchema.set('validateBeforeSave', true); // Enable validation before save

// Static method to find by project type - OPTIMIZED
projectSchema.statics.findByType = function(type) {
  return this.find({ cardProjectType: type, isActive: true })
    .select('-__v') // Exclude version field
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for faster queries when no modifications needed
};

// Static method to find active projects - OPTIMIZED
projectSchema.statics.findActive = function() {
  return this.find({ isActive: true })
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;