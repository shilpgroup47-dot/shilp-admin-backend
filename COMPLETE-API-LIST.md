📋 COMPLETE API LIST - Available After Authentication Fix

🔐 ADMIN AUTHENTICATION APIs:
✅ POST /api/admin/login - Login with email/password
✅ GET /api/admin/profile - Get admin profile
✅ POST /api/admin/verify-token - Verify JWT token
✅ POST /api/admin/forgot-password - Password reset

🏠 BANNER MANAGEMENT APIs:
✅ GET /api/banners - Get all banners
✅ POST /api/banners/:section/:field - Upload banner image (requires auth)
✅ PATCH /api/banners/:section/alt - Update banner alt text (requires auth)
✅ PUT /api/banners/:section/alt - Update banner alt text (requires auth)
✅ PUT /api/banners/blogsDetail/text - Update blogs detail text (requires auth)
✅ DELETE /api/banners/:section/:field - Delete banner image (requires auth)

Banner sections: homepageBanner, aboutUs, commercialBanner, plotBanner, 
residentialBanner, contactBanners, careerBanner, ourTeamBanner, 
termsConditionsBanner, privacyPolicyBanner, projectTreeBanner, blogsDetail

🏗️ PROJECT MANAGEMENT APIs:
✅ GET /api/projects - Get all projects (public)
✅ GET /api/projects/:id - Get single project (public)
✅ POST /api/projects - Create new project (requires auth)
✅ PUT /api/projects/:id - Update project (requires auth)
✅ DELETE /api/projects/:id - Delete project (requires auth)
✅ POST /api/projects/:id/upload - Upload project files (requires auth)

🌲 PROJECT TREE APIs:
✅ GET /api/projecttree - Get all project trees (public)
✅ GET /api/projecttree/:id - Get single project tree (public)
✅ POST /api/projecttree - Create new project tree (requires auth)
✅ PUT /api/projecttree/:id - Update project tree (requires auth)
✅ DELETE /api/projecttree/:id - Delete project tree (requires auth)
✅ POST /api/projecttree/:id/upload - Upload project tree files (requires auth)

📝 BLOG MANAGEMENT APIs:
✅ GET /api/blogs - Get all blogs (public)
✅ GET /api/blogs/:id - Get single blog (public)
✅ POST /api/blogs - Create new blog (requires auth)
✅ PUT /api/blogs/:id - Update blog (requires auth)
✅ DELETE /api/blogs/:id - Delete blog (requires auth)
✅ POST /api/blogs/:id/upload - Upload blog images (requires auth)

🌐 PUBLIC APIs (No Authentication Required):
✅ GET /api/public/* - Various public endpoints
✅ GET /api/health - Health check endpoint

📊 SYSTEM APIs:
✅ GET /api/logs - Get system logs (requires auth)

🔧 File Upload Support:
✅ Images: JPG, PNG, GIF, WebP, SVG
✅ Documents: PDF (for brochures)
✅ Max file size: 10MB per file

🔑 AUTHENTICATION HEADER FORMAT:
Authorization: Bearer YOUR_JWT_TOKEN

🎯 AFTER DEPLOYMENT, ALL THESE APIs WILL WORK WITH super_admin ROLE!

Login Credentials:
📧 Email: shilpgroup47@gmail.com
🔑 Password: ShilpGroup@RealState11290
👤 Role: super_admin (full access to all APIs)