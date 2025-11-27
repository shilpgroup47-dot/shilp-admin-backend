const bannerService = require('../services/bannerService');
const path = require('path');
const fs = require('fs');

exports.getBanners = async (req, res) => {
  try {
    const banners = await bannerService.getBanners();
    
    res.set({
      'Cache-Control': 'private, max-age=30',
      'ETag': `"${banners._id}-${banners.updatedAt?.getTime()}"`
    });
    
    res.json({ 
      success: true, 
      data: banners 
    });
  } catch (err) {
    console.error('❌ Error fetching banners:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch banners',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.uploadBannerImage = async (req, res) => {
  const { section, field } = req.params;
  const file = req.file;
  const alt = req.body.alt || '';
  
  if (!file) {
    return res.status(400).json({ 
      success: false, 
      error: 'No image uploaded' 
    });
  }

  const validSections = [
    'homepageBanner', 'aboutUs', 'commercialBanner', 'plotBanner',
    'residentialBanner', 'contactBanners', 'careerBanner', 'ourTeamBanner',
    'termsConditionsBanner', 'privacyPolicyBanner', 'projectTreeBanner', 'blogsDetail'
  ];
  const validFields = ['banner', 'mobilebanner', 'image', 'mobileimage'];

  if (section === 'blogsDetail' && field !== 'image' && field !== 'mobileimage') {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      success: false, 
      error: 'For blogsDetail section, only "image" and "mobileimage" fields are allowed' 
    });
  }

  if (!validSections.includes(section) || !validFields.includes(field)) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid section or field specified' 
    });
  }

  try {
    const imageUrl = `/uploads/banners/${file.filename}`;
    
    const fileMetadata = {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    };
    
    const updatedBanners = await bannerService.uploadBannerImage(section, field, imageUrl, alt, fileMetadata);
    
    res.json({ 
      success: true, 
      message: `${field === 'banner' ? 'Desktop' : 'Mobile'} banner uploaded successfully`,
      data: {
        section,
        field,
        imageUrl,
        metadata: fileMetadata,
        banners: updatedBanners
      }
    });
  } catch (err) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload image: ' + err.message 
    });
  }
};

exports.updateBannerAlt = async (req, res) => {
  const { section } = req.params;
  const { alt } = req.body;
  
  const validSections = [
    'homepageBanner', 'aboutUs', 'commercialBanner', 'plotBanner',
    'residentialBanner', 'contactBanners', 'careerBanner', 'ourTeamBanner',
    'termsConditionsBanner', 'privacyPolicyBanner', 'projectTreeBanner', 'blogsDetail'
  ];

  if (!validSections.includes(section)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid section specified' 
    });
  }

  if (typeof alt !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Alt text must be a string' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.updateBannerAlt(section, alt);
    res.json({ 
      success: true, 
      message: 'Alt text updated successfully',
      data: {
        section,
        alt,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Alt text update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update alt text: ' + err.message 
    });
  }
};

exports.updateBlogsDetailText = async (req, res) => {
  const { title, description } = req.body;
  
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and description must be strings' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.updateBlogsDetailText(title, description);
    res.json({ 
      success: true, 
      message: 'Blogs title and description updated successfully',
      data: {
        title,
        description,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Blogs text update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update blogs text: ' + err.message 
    });
  }
};

// Update commercial section title and description
exports.updateCommercialText = async (req, res) => {
  const { title, description } = req.body;
  
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and description must be strings' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.updateSectionText('commercialBanner', title, description);
    res.json({ 
      success: true, 
      message: 'Commercial title and description updated successfully',
      data: {
        title,
        description,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Commercial text update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update commercial text: ' + err.message 
    });
  }
};

// Update residential section title and description  
exports.updateResidentialText = async (req, res) => {
  const { title, description } = req.body;
  
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and description must be strings' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.updateSectionText('residentialBanner', title, description);
    res.json({ 
      success: true, 
      message: 'Residential title and description updated successfully',
      data: {
        title,
        description,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Residential text update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update residential text: ' + err.message 
    });
  }
};

// Update plots section title and description
exports.updatePlotsText = async (req, res) => {
  const { title, description } = req.body;
  
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and description must be strings' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.updateSectionText('plotBanner', title, description);
    res.json({ 
      success: true, 
      message: 'Plots title and description updated successfully',
      data: {
        title,
        description,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Plots text update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update plots text: ' + err.message 
    });
  }
};

exports.deleteBannerImage = async (req, res) => {
  const { section, field } = req.params;
  const { oldImageUrl } = req.body;
  
  const validSections = [
    'homepageBanner', 'aboutUs', 'commercialBanner', 'plotBanner',
    'residentialBanner', 'contactBanners', 'careerBanner', 'ourTeamBanner',
    'termsConditionsBanner', 'privacyPolicyBanner', 'projectTreeBanner', 'blogsDetail'
  ];
  const validFields = ['banner', 'mobilebanner', 'image', 'mobileimage'];

  if (section === 'blogsDetail' && field !== 'image' && field !== 'mobileimage') {
    return res.status(400).json({ 
      success: false, 
      error: 'For blogsDetail section, only "image" and "mobileimage" fields are allowed' 
    });
  }

  if (!validSections.includes(section) || !validFields.includes(field)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid section or field specified' 
    });
  }
  
  try {
    const updatedBanners = await bannerService.deleteBannerImage(section, field, oldImageUrl);
    res.json({ 
      success: true, 
      message: `${field === 'banner' ? 'Desktop' : 'Mobile'} banner deleted successfully`,
      data: {
        section,
        field,
        banners: updatedBanners
      }
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete image: ' + err.message 
    });
  }
};
