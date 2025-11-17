const validateFileSize = (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files) {
      return next();
    }

    // Check individual file sizes based on type
    const files = req.files;
    
    // Validate brochure file (max 100MB)
    if (files.brochure && files.brochure[0]) {
      const brochureFile = files.brochure[0];
      const maxBrochureSize = 100 * 1024 * 1024; // 100MB
      
      if (brochureFile.size > maxBrochureSize) {
        return res.status(400).json({
          success: false,
          message: `Brochure file is too large. Maximum size is 100MB. Current size: ${Math.round(brochureFile.size / (1024 * 1024))}MB`
        });
      }
    }

    // Validate image files (max 10MB each)
    const imageFields = ['aboutUsImage', 'cardImage', 'floorPlanImages', 'projectImageFiles', 'amenityFiles', 'updatedImageFiles'];
    const maxImageSize = 10 * 1024 * 1024; // 10MB

    for (const fieldName of imageFields) {
      if (files[fieldName]) {
        const fieldFiles = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
        
        for (const file of fieldFiles) {
          if (file && file.size > maxImageSize) {
            return res.status(400).json({
              success: false,
              message: `Image file "${file.originalname}" is too large. Maximum size is 10MB. Current size: ${Math.round(file.size / (1024 * 1024))}MB`
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('File size validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating file sizes'
    });
  }
};

module.exports = { validateFileSize };