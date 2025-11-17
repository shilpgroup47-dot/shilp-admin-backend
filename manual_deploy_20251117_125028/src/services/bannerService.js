const bannerRepository = require('../repositories/bannerRepository');
const fs = require('fs');
const path = require('path');

// Simple in-memory cache to reduce database calls
let bannersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds cache

const getBanners = async () => {
  // Temporarily disable cache to ensure fresh data
  
  const freshData = await bannerRepository.getBanners();
  
  // Check if freshData is already a plain object or needs conversion
  const cleanData = freshData.toObject ? freshData.toObject() : freshData;
  
  // Define all expected sections
  const expectedSections = [
    'homepageBanner', 'aboutUs', 'commercialBanner', 'plotBanner',
    'residentialBanner', 'contactBanners', 'careerBanner', 'ourTeamBanner',
    'termsConditionsBanner', 'privacyPolicyBanner', 'projectTreeBanner'
  ];
  
  // Check which sections are present
  const presentSections = expectedSections.filter(section => cleanData[section]);
  const missingSections = expectedSections.filter(section => !cleanData[section]);
  
  // Force add missing sections to the response
  missingSections.forEach(section => {
    cleanData[section] = {
      banner: '',
      mobilebanner: '',
      alt: '',
      bannerMetadata: {
        uploadedAt: null,
        filename: '',
        originalName: '',
        size: 0
      },
      mobilebannerMetadata: {
        uploadedAt: null,
        filename: '',
        originalName: '',
        size: 0
      }
    };
  });
  
  // Re-check after adding missing sections
  const finalPresentSections = expectedSections.filter(section => cleanData[section]);
  
  // Fresh data prepared
  
  return cleanData;
};

// Clear cache when data changes
const clearBannersCache = () => {
  bannersCache = null;
  cacheTimestamp = null;
  // Banner cache cleared
};

// Enhanced upload function with automatic previous image deletion and metadata
const uploadBannerImage = async (section, field, imageUrl, alt, fileMetadata = {}) => {
  try {
    // Get current banner data to check for existing image
    const currentBanners = await bannerRepository.getBanners();
    const existingImageUrl = currentBanners?.[section]?.[field];
    
    // Delete previous image if it exists
    if (existingImageUrl) {
      await deleteImageFile(existingImageUrl);
    }
    
    // Prepare update data with metadata
    const updateData = {
      [field]: imageUrl,
      [`${field}Metadata`]: {
        uploadedAt: new Date(),
        filename: fileMetadata.filename || '',
        originalName: fileMetadata.originalName || '',
        size: fileMetadata.size || 0
      }
    };
    
    // Update with new image and metadata
    const result = await bannerRepository.updateBannerFields(section, updateData);
    
    // Clear cache after data change
    clearBannersCache();
    
    return result;
  } catch (error) {
    console.error('Error in uploadBannerImage:', error);
    throw error;
  }
};

const updateBannerAlt = async (section, alt) => {
  const result = await bannerRepository.updateBannerField(section, 'alt', alt);
  
  // Clear cache after data change
  clearBannersCache();
  
  return result;
};

// Update blogsDetail title and description
const updateBlogsDetailText = async (title, description) => {
  const updateData = {
    title: title || '',
    description: description || ''
  };
  
  const result = await bannerRepository.updateBannerFields('blogsDetail', updateData);
  
  // Clear cache after data change
  clearBannersCache();
  
  return result;
};

// Enhanced delete function with better error handling
const deleteBannerImage = async (section, field, oldImageUrl) => {
  try {
    console.log(`🎏 Deleting banner image - Section: ${section}, Field: ${field}`);
    
    // Delete the physical file first
    if (oldImageUrl) {
      console.log(`🗑️ Deleting banner image file: ${oldImageUrl}`);
      await deleteImageFile(oldImageUrl);
    }
    
    // Clear the database field
    const result = await bannerRepository.deleteBannerField(section, field);
    
    // Clear cache after data change
    clearBannersCache();
    
    console.log(`✅ Successfully deleted banner image - Section: ${section}, Field: ${field}`);
    return result;
  } catch (error) {
    console.error(`❌ Error in deleteBannerImage (${section}/${field}):`, error);
    throw error;
  }
};

// Helper function to delete image files with enhanced path handling
const deleteImageFile = async (imageUrl) => {
  if (!imageUrl) {
    console.log('📝 No banner image URL provided for deletion');
    return;
  }
  
  try {
    // Handle both relative and absolute URLs
    let filePath;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Extract path from full URL
      const url = new URL(imageUrl);
      filePath = path.join(process.cwd(), url.pathname.replace(/^\//, ''));
    } else if (imageUrl.startsWith('/')) {
      // Handle absolute path from root
      filePath = path.join(process.cwd(), imageUrl.replace(/^\//, ''));
    } else {
      // Handle relative path
      filePath = path.join(process.cwd(), 'uploads', 'banners', imageUrl);
    }
    
    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Successfully deleted banner image: ${imageUrl}`);
    } else {
      console.log(`📝 Banner image file not found (already deleted): ${imageUrl}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting banner image ${imageUrl}:`, error.message);
    // Don't throw error - file deletion failure shouldn't stop the operation
  }
};

module.exports = {
  getBanners,
  uploadBannerImage,
  updateBannerAlt,
  updateBlogsDetailText,
  deleteBannerImage,
  clearBannersCache, // Export cache clearing function
};
