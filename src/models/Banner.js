const mongoose = require('mongoose');

const bannerSectionSchema = new mongoose.Schema({
  banner: { 
    type: String, 
    default: '' 
  },
  mobilebanner: { 
    type: String, 
    default: '' 
  },
  alt: { 
    type: String, 
    default: '' 
  },
  bannerMetadata: {
    uploadedAt: { type: Date, default: null },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    size: { type: Number, default: 0 }
  },
  mobilebannerMetadata: {
    uploadedAt: { type: Date, default: null },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    size: { type: Number, default: 0 }
  }
}, { _id: false }); // Disable _id for subdocuments

// Blogs Detail schema for blogs image section
const blogsDetailSchema = new mongoose.Schema({
  image: { 
    type: String, 
    default: '' 
  },
  mobileimage: { 
    type: String, 
    default: '' 
  },
  alt: { 
    type: String, 
    default: '' 
  },
  title: { 
    type: String, 
    default: '' 
  },
  description: { 
    type: String, 
    default: '' 
  },
  imageMetadata: {
    uploadedAt: { type: Date, default: null },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    size: { type: Number, default: 0 }
  },
  mobileimageMetadata: {
    uploadedAt: { type: Date, default: null },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    size: { type: Number, default: 0 }
  }
}, { _id: false }); // Disable _id for subdocuments

const bannerSchema = new mongoose.Schema({
  // Main banner sections with default values
  homepageBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  aboutUs: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  commercialBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  plotBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  residentialBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  contactBanners: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  careerBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  ourTeamBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  termsConditionsBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  privacyPolicyBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  projectTreeBanner: { 
    type: bannerSectionSchema, 
    default: () => ({}) 
  },
  blogsDetail: { 
    type: blogsDetailSchema, 
    default: () => ({}) 
  },
  
  documentId: { 
    type: String, 
    default: 'main-banners', 
    unique: true,
    index: true
  }
}, { 
  timestamps: true,
  versionKey: '__v',
  // This ensures all schema fields are included even if empty
  minimize: false
});

// Pre-save hook to ensure all sections exist
bannerSchema.pre('save', function(next) {
  const requiredSections = [
    'homepageBanner', 'aboutUs', 'commercialBanner', 'plotBanner',
    'residentialBanner', 'contactBanners', 'careerBanner', 'ourTeamBanner',
    'termsConditionsBanner', 'privacyPolicyBanner', 'projectTreeBanner', 'blogsDetail'
  ];
  
  requiredSections.forEach(section => {
    if (!this[section]) {
      this[section] = {};
    }
  });
  
  next();
});


module.exports = mongoose.model('Banner', bannerSchema);