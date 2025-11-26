const projectRepository = require('../repositories/projectRepository');
const fs = require('fs').promises;
const path = require('path');

class ProjectService {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {Object} files - Uploaded files
   * @returns {Promise<Object>} Created project
   */
  async createProject(projectData, files = {}, isDraft = false) {
    let savedFiles = []; // Track saved files for cleanup
    
    try {
      // DEBUG: Log incoming projectData
      
      // Check if slug already exists
      const slugExists = await projectRepository.slugExists(projectData.slug);
      if (slugExists) {
        throw new Error(`Project with slug '${projectData.slug}' already exists`);
      }

      // Process file uploads and update paths
      const processedData = await this.processFileUploads(projectData, files);
      
      // DEBUG: Log after file processing
      
      // Extract saved file paths for cleanup if needed
      savedFiles = this.extractSavedFilePaths(processedData);

      // Create project. When saving drafts, skip Mongoose validation so partial saves succeed.
      const project = await projectRepository.create(processedData, { validateBeforeSave: isDraft ? false : true });
      
      
      return {
        success: true,
        message: 'Project created successfully',
        data: project
      };
    } catch (error) {
      // Clean up saved files if project creation fails
      await this.cleanupSavedFiles(savedFiles);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProjectById(id) {
    try {
      const project = await projectRepository.findById(id);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return {
        success: true,
        data: project
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get project by slug
   * @param {string} slug - Project slug
   * @returns {Promise<Object>} Project data
   */
  async getProjectBySlug(slug) {
    try {
      const project = await projectRepository.findBySlug(slug);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return {
        success: true,
        data: project
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if slug exists
   * @param {string} slug - Slug to check
   * @returns {Promise<boolean>} True if slug exists
   */
  async checkSlugExists(slug) {
    try {
      return await projectRepository.slugExists(slug);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all projects with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Projects with pagination
   */
  async getAllProjects(options = {}) {
    try {
      const result = await projectRepository.findAll(options);
      
      return {
        success: true,
        data: result.projects,
        pagination: result.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get projects by state
   * @param {string} state - Project state
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Projects
   */
  async getProjectsByState(state, options = {}) {
    try {
      const validStates = ['on-going', 'completed'];
      if (!validStates.includes(state)) {
        throw new Error(`Invalid state. Must be one of: ${validStates.join(', ')}`);
      }

      const projects = await projectRepository.findByState(state, options);
      
      return {
        success: true,
        data: projects
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get projects by type
   * @param {string} type - Project type
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Projects
   */
  async getProjectsByType(type, options = {}) {
    try {
      const validTypes = ['residential', 'commercial', 'plot'];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }

      const projects = await projectRepository.findByType(type, options);
      
      return {
        success: true,
        data: projects
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} updateData - Update data
   * @param {Object} files - New uploaded files
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(id, updateData, files = {}, isDraft = false) {
    let newSavedFiles = []; // Track new files for cleanup
    
    try {
      const existingProject = await projectRepository.findById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Check slug uniqueness if slug is being updated
      if (updateData.slug && updateData.slug !== existingProject.slug) {
        const slugExists = await projectRepository.slugExists(updateData.slug, id);
        if (slugExists) {
          throw new Error(`Project with slug '${updateData.slug}' already exists`);
        }
      }

      // Process file uploads and handle deletions
      const processedData = await this.processFileUploads(updateData, files, existingProject);
      
      // Handle specific deletions before merging with existing data
      await this.handleSpecificDeletions(updateData, existingProject, processedData);
      
      // Merge with existing data to preserve non-updated fields
      const finalData = this.mergeWithExistingData(processedData, existingProject);
      
      // Extract only new file paths (excluding existing ones)
      newSavedFiles = this.extractNewFilePaths(finalData, existingProject);

      // Update project. When updating a draft, skip validators to allow partial updates.
      const updatedProject = await projectRepository.update(id, finalData, { runValidators: isDraft ? false : true });
      
      return {
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      };
    } catch (error) {
      // Clean up new uploaded files if update fails
      await this.cleanupSavedFiles(newSavedFiles);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project
   * @param {string} id - Project ID
   * @param {boolean} soft - Soft delete flag
   * @returns {Promise<Object>} Delete result
   */
  async deleteProject(id, soft = true) {
    try {
      const project = await projectRepository.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      console.log(`🗑️ Deleting project: ${project.title || id} (${soft ? 'soft' : 'permanent'} delete)`);

      let result;
      if (soft) {
        console.log(`📝 Performing soft delete - project will be deactivated but images preserved`);
        result = await projectRepository.softDelete(id);
      } else {
        console.log(`⚠️ Performing PERMANENT delete - all project data and images will be removed`);
        // Clean up files before hard delete
        await this.cleanupProjectFiles(project);
        result = await projectRepository.delete(id);
      }
      
      console.log(`✅ Successfully ${soft ? 'deactivated' : 'deleted'} project: ${project.title || id}`);
      return {
        success: true,
        message: `Project ${soft ? 'deactivated' : 'deleted'} successfully`,
        data: result
      };
    } catch (error) {
      console.error(`❌ Error deleting project ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Toggle project active status
   * @param {string} id - Project ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Update result
   */
  async toggleProjectStatus(id, isActive) {
    try {
      const project = await projectRepository.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedProject = await projectRepository.update(id, { isActive });
      
      return {
        success: true,
        message: `Project ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedProject
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search projects
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchProjects(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters long');
      }

      const projects = await projectRepository.search(searchTerm.trim(), options);
      
      return {
        success: true,
        data: projects,
        searchTerm: searchTerm.trim()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStats() {
    try {
      const stats = await projectRepository.getStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process file uploads and return updated data with file paths
   * @param {Object} data - Original data
   * @param {Object} files - Uploaded files
   * @param {Object} existingProject - Existing project for updates
   * @returns {Promise<Object>} Processed data with file paths
   */
  async processFileUploads(data, files = {}, existingProject = null) {
    const processedData = { ...data };
    
    console.log('🔧 Processing file uploads...');
    console.log('📁 Files received:', files ? Object.keys(files) : 'No files');
    console.log('📁 Files details:', files ? Object.keys(files).map(key => ({
      field: key,
      count: Array.isArray(files[key]) ? files[key].length : 1,
      names: Array.isArray(files[key]) ? files[key].map(f => f.originalname) : [files[key]?.originalname]
    })) : 'No file details');
    console.log('🏗️ Is Update?', !!existingProject);
    
    // Create project-specific folder based on projectTitle
    const projectFolderName = this.createSafeDirectoryName(data.projectTitle || existingProject?.projectTitle || 'untitled');
    const uploadDir = path.join(process.cwd(), 'uploads', 'projects', projectFolderName);

    // Ensure upload directory exists
    await this.ensureDirectoryExists(uploadDir);

    try {
      // Process brochure file
      if (files.brochure && files.brochure[0]) {
        const brochurePath = await this.saveFile(files.brochure[0], uploadDir, 'brochure', projectFolderName);
        processedData.brochure = brochurePath;
        
        // Delete old brochure if updating
        if (existingProject && existingProject.brochure) {
          await this.deleteFile(existingProject.brochure);
        }
      }

      // Process about us image and update aboutUsDetail
      if (files.aboutUsImage && files.aboutUsImage[0]) {
        const aboutUsImagePath = await this.saveFile(files.aboutUsImage[0], uploadDir, 'about', projectFolderName);
        
        // Update aboutUsDetail.image.url (preserve existing description fields)
        if (!processedData.aboutUsDetail) {
          processedData.aboutUsDetail = {
            description1: '',
            description2: '',
            description3: '',
            description4: '',
            image: {}
          };
        }
        if (!processedData.aboutUsDetail.image) {
          processedData.aboutUsDetail.image = {};
        }
        
        processedData.aboutUsDetail.image.url = aboutUsImagePath;
        
        
        // Delete old about us image if updating
        if (existingProject && existingProject.aboutUsDetail && existingProject.aboutUsDetail.image && existingProject.aboutUsDetail.image.url) {
          await this.deleteFile(existingProject.aboutUsDetail.image.url);
        }
      } else if (data.deleteAboutImage === 'true' && existingProject) {
        // User wants to delete the about us image
        if (existingProject.aboutUsDetail && existingProject.aboutUsDetail.image && existingProject.aboutUsDetail.image.url) {
          await this.deleteFile(existingProject.aboutUsDetail.image.url);
        }
        // Clear the image URL but preserve alt text and descriptions
        if (processedData.aboutUsDetail && processedData.aboutUsDetail.image) {
          processedData.aboutUsDetail.image.url = '';
        }
      } else {
        // No image uploaded, ensure aboutUsDetail structure exists
        if (processedData.aboutUsDetail) {
          if (!processedData.aboutUsDetail.image) {
            processedData.aboutUsDetail.image = { alt: processedData.aboutUsDetail.image?.alt || '' };
          }
        }
      }

      // Process banner section images - FIXED field names
      // Desktop banner image (frontend sends 'desktopBanner')
      if (files.desktopBanner && files.desktopBanner[0]) {
        const desktopBannerPath = await this.saveFile(files.desktopBanner[0], uploadDir, 'banner-desktop', projectFolderName);
        
        if (!processedData.bannerSection) {
          processedData.bannerSection = {
            desktopBannerImage: '',
            mobileBannerImage: '',
            alt: ''
          };
        }
        processedData.bannerSection.desktopBannerImage = desktopBannerPath;
        
        // Delete old desktop banner if updating
        if (existingProject && existingProject.bannerSection && existingProject.bannerSection.desktopBannerImage) {
          await this.deleteFile(existingProject.bannerSection.desktopBannerImage);
        }
      }

      // Mobile banner image (frontend sends 'mobileBanner')
      if (files.mobileBanner && files.mobileBanner[0]) {
        const mobileBannerPath = await this.saveFile(files.mobileBanner[0], uploadDir, 'banner-mobile', projectFolderName);
        
        if (!processedData.bannerSection) {
          processedData.bannerSection = {
            desktopBannerImage: '',
            mobileBannerImage: '',
            alt: ''
          };
        }
        processedData.bannerSection.mobileBannerImage = mobileBannerPath;
        
        // Delete old mobile banner if updating
        if (existingProject && existingProject.bannerSection && existingProject.bannerSection.mobileBannerImage) {
          await this.deleteFile(existingProject.bannerSection.mobileBannerImage);
        }
      }

      // Process floor plan images - handle both create and update
      if (files.floorPlanImages && files.floorPlanImages.length > 0 && processedData.floorPlans) {
        console.log('🏗️ Processing floor plan images:', {
          filesCount: files.floorPlanImages.length,
          floorPlansCount: processedData.floorPlans.length,
          isUpdate: !!existingProject
        });
        
        let fileIndex = 0;
        for (let i = 0; i < processedData.floorPlans.length; i++) {
          const plan = processedData.floorPlans[i];
          // For create: process all plans that have data, for update: only process if hasNewFile flag
          const shouldProcess = existingProject ? plan.hasNewFile : true; // Always process in create mode
          console.log(`Floor plan ${i}:`, { title: plan.title, alt: plan.alt, shouldProcess, fileIndex });
          
          if (shouldProcess && fileIndex < files.floorPlanImages.length) {
            // Delete old image if updating and exists
            if (existingProject && plan.id) {
              const existingPlan = existingProject.floorPlans?.find(fp => fp.id?.toString() === plan.id || fp._id?.toString() === plan.id);
              if (existingPlan && existingPlan.image) {
                console.log(`🗑️ Deleting old floor plan image: ${existingPlan.image}`);
                await this.deleteFile(existingPlan.image);
              }
            }
            
            const floorPlanPath = await this.saveFile(files.floorPlanImages[fileIndex], uploadDir, `floorplan_${Date.now()}_${i}`, projectFolderName);
            plan.image = floorPlanPath;
            console.log(`✅ Saved floor plan image: ${floorPlanPath}`);
            fileIndex++;
          }
        }
      }

      // Process project images - handle both create and update
      if (files.projectImageFiles && files.projectImageFiles.length > 0 && processedData.projectImages) {
        console.log('📸 Processing project images:', {
          filesCount: files.projectImageFiles.length,
          projectImagesCount: processedData.projectImages.length,
          isUpdate: !!existingProject
        });
        
        let fileIndex = 0;
        for (let i = 0; i < processedData.projectImages.length; i++) {
          const img = processedData.projectImages[i];
          // For create: process all images, for update: only process if hasNewFile flag
          const shouldProcess = existingProject ? img.hasNewFile : true; // Always process in create mode
          console.log(`Project image ${i}:`, { alt: img.alt, shouldProcess, fileIndex });
          
          if (shouldProcess && fileIndex < files.projectImageFiles.length) {
            // Delete old image if updating and exists
            if (existingProject && img.id) {
              const existingImg = existingProject.projectImages?.find(pImg => pImg.id?.toString() === img.id || pImg._id?.toString() === img.id);
              if (existingImg && existingImg.image) {
                console.log(`🗑️ Deleting old project image: ${existingImg.image}`);
                await this.deleteFile(existingImg.image);
              }
            }
            
            const projectImagePath = await this.saveFile(files.projectImageFiles[fileIndex], uploadDir, `project_${Date.now()}_${i}`, projectFolderName);
            img.image = projectImagePath;
            console.log(`✅ Saved project image: ${projectImagePath}`);
            fileIndex++;
          }
        }
      }

      // Process amenity images - handle both create and update
      if (files.amenityFiles && files.amenityFiles.length > 0 && processedData.amenities) {
        console.log('🏠 Processing amenity images:', {
          filesCount: files.amenityFiles.length,
          amenitiesCount: processedData.amenities.length,
          isUpdate: !!existingProject
        });
        
        let fileIndex = 0;
        for (let i = 0; i < processedData.amenities.length; i++) {
          const amenity = processedData.amenities[i];
          // For create: process all amenities, for update: only process if hasNewFile flag
          const shouldProcess = existingProject ? amenity.hasNewFile : true; // Always process in create mode
          console.log(`Amenity ${i}:`, { title: amenity.title, alt: amenity.alt, shouldProcess, fileIndex });
          
          if (shouldProcess && fileIndex < files.amenityFiles.length) {
            // Delete old image if updating and exists
            if (existingProject && amenity.id) {
              const existingAmenity = existingProject.amenities?.find(am => am.id?.toString() === amenity.id || am._id?.toString() === amenity.id);
              if (existingAmenity && existingAmenity.svgOrImage) {
                console.log(`🗑️ Deleting old amenity image: ${existingAmenity.svgOrImage}`);
                await this.deleteFile(existingAmenity.svgOrImage);
              }
            }
            
            const amenityPath = await this.saveFile(files.amenityFiles[fileIndex], uploadDir, `amenity_${Date.now()}_${i}`, projectFolderName);
            amenity.svgOrImage = amenityPath;
            console.log(`✅ Saved amenity image: ${amenityPath}`);
            fileIndex++;
          }
        }
      }

      // Process updated images - handle both create and update
      if (files.updatedImageFiles && files.updatedImageFiles.length > 0 && processedData.updatedImages) {
        console.log('📅 Processing updated images:', {
          filesCount: files.updatedImageFiles.length,
          updatedImagesCount: processedData.updatedImages.length,
          isUpdate: !!existingProject
        });
        
        let fileIndex = 0;
        for (let i = 0; i < processedData.updatedImages.length; i++) {
          const img = processedData.updatedImages[i];
          // For create: process all images, for update: only process if hasNewFile flag
          const shouldProcess = existingProject ? img.hasNewFile : true; // Always process in create mode
          console.log(`Updated image ${i}:`, { alt: img.alt, shouldProcess, fileIndex });
          
          if (shouldProcess && fileIndex < files.updatedImageFiles.length) {
            // Delete old image if updating and exists
            if (existingProject && img.id) {
              const existingImg = existingProject.updatedImages?.find(uImg => uImg.id?.toString() === img.id || uImg._id?.toString() === img.id);
              if (existingImg && existingImg.image) {
                console.log(`🗑️ Deleting old updated image: ${existingImg.image}`);
                await this.deleteFile(existingImg.image);
              }
            }
            
            const updatedImagePath = await this.saveFile(files.updatedImageFiles[fileIndex], uploadDir, `updated_${Date.now()}_${i}`, projectFolderName);
            img.image = updatedImagePath;
            console.log(`✅ Saved updated image: ${updatedImagePath}`);
            fileIndex++;
          }
        }
      }

      // Process card image
      if (files.cardImage && files.cardImage[0]) {
        const cardImagePath = await this.saveFile(files.cardImage[0], uploadDir, 'card', projectFolderName);
        processedData.cardImage = cardImagePath;
        
        // Delete old card image if updating
        if (existingProject && existingProject.cardImage) {
          await this.deleteFile(existingProject.cardImage);
        }
      }

      
      return processedData;
    } catch (error) {
      throw new Error(`File upload processing failed: ${error.message}`);
    }
  }

  /**
   * Save uploaded file with dynamic naming
   * @param {Object} file - Multer file object
   * @param {string} uploadDir - Upload directory
   * @param {string} prefix - File name prefix
   * @param {string} projectFolderName - Project folder name
   * @returns {Promise<string>} File path
   */
  async saveFile(file, uploadDir, prefix, projectFolderName) {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${prefix}_${timestamp}_${randomStr}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // If multer stored the file on disk, move/copy it to our project folder
      const srcPath = file.path || (file.destination && file.filename ? path.join(file.destination, file.filename) : null);

      if (srcPath) {
        try {
          await fs.rename(srcPath, filePath);
        } catch (err) {
          // If rename fails (cross-device), fallback to copy + unlink
          try {
            await fs.copyFile(srcPath, filePath);
            try { await fs.unlink(srcPath); } catch (e) {}
          } catch (copyErr) {
            console.error('❌ Failed to move/copy uploaded file', { srcPath, file, err: copyErr.message });
            throw copyErr;
          }
        }
      } else if (file.buffer) {
        // Write file buffer to disk (memory storage)
        await fs.writeFile(filePath, file.buffer);
      } else {
        console.error('❌ No file data available on multer file object', file);
        throw new Error('No file data available to save');
      }

      // Return relative path for database storage
      return path.join('uploads', 'projects', projectFolderName, fileName).replace(/\\/g, '/');
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Delete a file with enhanced logging and error handling
   * @param {string} filePath - File path to delete
   */
  async deleteFile(filePath) {
    try {
      if (!filePath) {
        console.log('📝 No file path provided for deletion');
        return;
      }

      // Remove leading slash if present to ensure correct path construction
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const fullPath = path.join(process.cwd(), cleanPath);
      
      // Check if file exists before attempting deletion
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      console.log(`🗑️ Successfully deleted file: ${filePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`📝 File not found (already deleted or moved): ${filePath}`);
      } else {
        console.error(`❌ Error deleting file ${filePath}:`, error.message);
      }
      // Don't throw error - continue processing even if file deletion fails
    }
  }

  /**
   * Clean up uploaded files
   * @param {Object} files - Files to clean up
   */
  async cleanupFiles(files) {
    const filesToCleanup = [];
    
    // Collect all files
    Object.values(files).forEach(fileArray => {
      if (Array.isArray(fileArray)) {
        filesToCleanup.push(...fileArray);
      } else {
        filesToCleanup.push(fileArray);
      }
    });

    // Delete files
    for (const file of filesToCleanup) {
      if (file && file.path) {
        await this.deleteFile(file.path);
      }
    }
  }

  /**
   * Extract all saved file paths from processed data
   * @param {Object} processedData - Processed project data
   * @returns {Array} Array of file paths
   */
  extractSavedFilePaths(processedData) {
    const filePaths = [];
    
    // Add main file paths
    if (processedData.brochure) filePaths.push(processedData.brochure);
    if (processedData.aboutUsDetail && processedData.aboutUsDetail.image && processedData.aboutUsDetail.image.url) {
      filePaths.push(processedData.aboutUsDetail.image.url);
    }
    if (processedData.cardImage) filePaths.push(processedData.cardImage);
    
    // Add floor plan images
    if (processedData.floorPlans && Array.isArray(processedData.floorPlans)) {
      processedData.floorPlans.forEach(fp => {
        if (fp.image) filePaths.push(fp.image);
      });
    }
    
    // Add project images
    if (processedData.projectImages && Array.isArray(processedData.projectImages)) {
      processedData.projectImages.forEach(img => {
        if (img.image) filePaths.push(img.image);
      });
    }
    
    // Add amenity images
    if (processedData.amenities && Array.isArray(processedData.amenities)) {
      processedData.amenities.forEach(amenity => {
        if (amenity.svgOrImage) filePaths.push(amenity.svgOrImage);
      });
    }
    
    // Add updated images
    if (processedData.updatedImages && Array.isArray(processedData.updatedImages)) {
      processedData.updatedImages.forEach(img => {
        if (img.image) filePaths.push(img.image);
      });
    }
    
    return filePaths;
  }

  /**
   * Extract only new file paths (not present in existing project)
   * @param {Object} processedData - Processed project data
   * @param {Object} existingProject - Existing project data
   * @returns {Array} Array of new file paths only
   */
  extractNewFilePaths(processedData, existingProject) {
    const allNewPaths = this.extractSavedFilePaths(processedData);
    const existingPaths = this.extractSavedFilePaths(existingProject);
    
    // Return only paths that are new (not in existing project)
    return allNewPaths.filter(path => !existingPaths.includes(path));
  }

  /**
   * Clean up saved files by file paths
   * @param {Array} filePaths - Array of file paths to delete
   */
  async cleanupSavedFiles(filePaths) {
    if (!filePaths || filePaths.length === 0) {
      return;
    }
    
  // Cleaning up saved files
    
    for (const filePath of filePaths) {
      try {
        if (filePath) {
          const fullPath = path.join(process.cwd(), filePath);
          await fs.unlink(fullPath);
        }
      } catch (error) {
      }
    }
  }

  /**
   * Clean up all files associated with a project
   * @param {Object} project - Project object
   */
  /**
   * Clean up all files associated with a project
   * @param {Object} project - Project data
   */
  async cleanupProjectFiles(project) {
    console.log(`🧹 Starting cleanup for project: ${project.title || project._id}`);
    const filesToDelete = [];

    // Collect all file paths
    if (project.brochure) filesToDelete.push(project.brochure);
    if (project.aboutUsDetail && project.aboutUsDetail.image && project.aboutUsDetail.image.url) {
      filesToDelete.push(project.aboutUsDetail.image.url);
    }
    if (project.cardImage) filesToDelete.push(project.cardImage);

    // Floor plan images
    if (project.floorPlans) {
      project.floorPlans.forEach((plan, index) => {
        if (plan.image) {
          filesToDelete.push(plan.image);
          console.log(`📋 Found floor plan ${index + 1} image: ${plan.image}`);
        }
      });
    }

    // Project images
    if (project.projectImages) {
      project.projectImages.forEach((img, index) => {
        if (img.image) {
          filesToDelete.push(img.image);
          console.log(`🖼️ Found project gallery image ${index + 1}: ${img.image}`);
        }
      });
    }

    // Amenity files
    if (project.amenities) {
      project.amenities.forEach((amenity, index) => {
        if (amenity.svgOrImage) {
          filesToDelete.push(amenity.svgOrImage);
          console.log(`✨ Found amenity ${index + 1} image: ${amenity.svgOrImage}`);
        }
      });
    }

    // Updated images
    if (project.updatedImages) {
      project.updatedImages.forEach((img, index) => {
        if (img.image) {
          filesToDelete.push(img.image);
          console.log(`📸 Found updated image ${index + 1}: ${img.image}`);
        }
      });
    }

    console.log(`📊 Total files to delete: ${filesToDelete.length}`);

    // Delete all files
    for (const filePath of filesToDelete) {
      await this.deleteFile(filePath);
    }

    console.log(`✅ Completed cleanup for project: ${project.title || project._id}`);
  }

  /**
   * Handle specific deletions based on delete flags
   * @param {Object} updateData - Update data with delete flags
   * @param {Object} existingProject - Existing project data
   * @param {Object} processedData - Processed data to modify
   */
  async handleSpecificDeletions(updateData, existingProject, processedData) {
    console.log('🎯 Processing specific deletions...');

    // Handle individual floor plan deletions
    if (updateData.deleteFloorPlans && Array.isArray(updateData.deleteFloorPlans)) {
      console.log(`🗑️ Deleting ${updateData.deleteFloorPlans.length} floor plan(s)`);
      for (const deletionId of updateData.deleteFloorPlans) {
        const planToDelete = existingProject.floorPlans?.find(fp => fp.id?.toString() === deletionId || fp._id?.toString() === deletionId);
        if (planToDelete && planToDelete.image) {
          console.log(`📋 Deleting floor plan image: ${planToDelete.image}`);
          await this.deleteFile(planToDelete.image);
        }
      }
    }

    // Handle individual project image deletions
    if (updateData.deleteProjectImages && Array.isArray(updateData.deleteProjectImages)) {
      console.log(`🗑️ Deleting ${updateData.deleteProjectImages.length} project gallery image(s)`);
      for (const deletionId of updateData.deleteProjectImages) {
        const imageToDelete = existingProject.projectImages?.find(img => img.id?.toString() === deletionId || img._id?.toString() === deletionId);
        if (imageToDelete && imageToDelete.image) {
          console.log(`🖼️ Deleting project gallery image: ${imageToDelete.image}`);
          await this.deleteFile(imageToDelete.image);
        }
      }
    }

    // Handle individual amenity deletions
    if (updateData.deleteAmenities && Array.isArray(updateData.deleteAmenities)) {
      console.log(`🗑️ Deleting ${updateData.deleteAmenities.length} amenity/amenities`);
      for (const deletionId of updateData.deleteAmenities) {
        const amenityToDelete = existingProject.amenities?.find(am => am.id?.toString() === deletionId || am._id?.toString() === deletionId);
        if (amenityToDelete && amenityToDelete.svgOrImage) {
          console.log(`✨ Deleting amenity image: ${amenityToDelete.svgOrImage}`);
          await this.deleteFile(amenityToDelete.svgOrImage);
        }
      }
    }

    // Handle individual updated image deletions
    if (updateData.deleteUpdatedImages && Array.isArray(updateData.deleteUpdatedImages)) {
      console.log(`🗑️ Deleting ${updateData.deleteUpdatedImages.length} updated image(s)`);
      for (const deletionId of updateData.deleteUpdatedImages) {
        const imageToDelete = existingProject.updatedImages?.find(img => img.id?.toString() === deletionId || img._id?.toString() === deletionId);
        if (imageToDelete && imageToDelete.image) {
          console.log(`📸 Deleting updated image: ${imageToDelete.image}`);
          await this.deleteFile(imageToDelete.image);
        }
      }
    }

    console.log('✅ Completed specific deletions processing');
  }

  /**
   * Merge processed data with existing data to preserve non-updated fields
   * @param {Object} processedData - Processed update data
   * @param {Object} existingProject - Existing project data
   * @returns {Object} Merged data
   */
  mergeWithExistingData(processedData, existingProject) {
    const finalData = { ...processedData };

    // For arrays, we've already handled the merging in handleSpecificDeletions
    // No need to re-merge here as the processed data already contains the correct arrays

    // Preserve existing aboutUsDetail structure if not being updated
    if (!processedData.aboutUsDetail && existingProject.aboutUsDetail) {
      finalData.aboutUsDetail = existingProject.aboutUsDetail;
    } else if (processedData.aboutUsDetail && existingProject.aboutUsDetail) {
      // Merge aboutUsDetail, preserving existing image if not being updated
      finalData.aboutUsDetail = {
        ...existingProject.aboutUsDetail,
        ...processedData.aboutUsDetail
      };
      
      // If no new image and no delete flag, preserve existing image
      if (!processedData.aboutUsDetail.image?.url && !processedData.deleteAboutImage) {
        finalData.aboutUsDetail.image = existingProject.aboutUsDetail.image || {};
      }
    }

    return finalData;
  }

  /**
   * Create a safe directory name from project title
   * @param {string} title - Project title
   * @returns {string} Safe directory name
   */
  createSafeDirectoryName(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length to 50 characters
      || 'untitled'; // Fallback if title becomes empty
  }
}

module.exports = new ProjectService();