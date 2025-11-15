# 📁 Uploads Management & Deployment Guide

## 🎯 Problem Solved: Preserve User Uploads During Deployment

### ⚠️ Issue:
- Git mein user uploaded files (images) include nahi honi chahiye
- cPanel deployment ke time existing uploads replace nahi hone chahiye
- Directory structure maintain rehna chahiye

### ✅ Solution Applied:

## 📂 File Upload Strategy

### **1. .gitignore Configuration**
```gitignore
# Uploaded files (user content) - Preserve existing files during deployment
uploads/*
!uploads/.gitkeep
!uploads/*/.gitkeep
```

**What this does:**
- ❌ Ignores all files in uploads directories
- ✅ Includes .gitkeep files to maintain directory structure
- 🔄 Preserves existing uploads during deployment

### **2. Directory Structure Maintained**
```
uploads/
├── banners/.gitkeep     ✅ Tracked in Git
├── blogs/.gitkeep       ✅ Tracked in Git
├── projects/.gitkeep    ✅ Tracked in Git
├── projecttree/.gitkeep ✅ Tracked in Git
├── banners/image1.jpg   ❌ Not tracked (user content)
├── blogs/blog1.jpg      ❌ Not tracked (user content)
└── projects/proj1.jpg   ❌ Not tracked (user content)
```

## 🚀 Deployment Process (Uploads Preserved)

### **Method 1: cPanel Auto-Deployment (.cpanel.yml)**
1. **Backup existing uploads** before deployment
2. **Deploy new code** (excluding uploads)
3. **Restore uploads** from backup
4. **Create missing directories** if needed
5. **Set proper permissions**

### **Method 2: GitHub Actions Deployment**
1. **Preserve uploads** during backup
2. **Extract new code** to temporary location
3. **Restore uploads** to new deployment
4. **Install dependencies**
5. **Start application**

### **Method 3: Manual Git Pull (deploy.sh)**
1. **Backup uploads** to temporary location
2. **Pull latest code** from Git
3. **Restore uploads** from backup
4. **Install dependencies**
5. **Restart application**

## 🔧 How It Works:

### **During Git Push:**
```bash
git add .        # Only .gitkeep files from uploads/
git commit -m "Code update"
git push origin main    # No user images pushed
```

### **During cPanel Deployment:**
```bash
# 1. Backup existing uploads
cp -R /api/uploads /api/uploads_backup

# 2. Deploy new code
git pull origin main

# 3. Restore uploads
cp -R /api/uploads_backup/* /api/uploads/

# 4. Clean backup
rm -rf /api/uploads_backup
```

## 📋 Benefits:

✅ **Git Repository Clean**: No large image files in Git history  
✅ **Fast Deployments**: Only code changes pushed  
✅ **User Data Preserved**: Existing images never lost  
✅ **Directory Structure**: Always maintained via .gitkeep  
✅ **Automatic Process**: All handled by deployment scripts  

## 🔍 Verification Commands:

### **Check Git Status:**
```bash
git status
# Should show only code files, not uploads
```

### **Test Deployment:**
```bash
# Check uploads preserved after deployment
ls -la uploads/banners/    # Should show existing images
ls -la uploads/blogs/      # Should show existing images
ls -la uploads/projects/   # Should show existing images
```

### **Check Directory Structure:**
```bash
find uploads/ -name ".gitkeep"
# Should show all .gitkeep files
```

## 🆘 Troubleshooting:

### **If Uploads Are Missing After Deployment:**
1. Check backup location: `uploads_backup_*`
2. Restore manually: `cp -R uploads_backup_*/* uploads/`
3. Check permissions: `chmod 755 uploads uploads/*`

### **If Directory Structure Is Missing:**
1. Git pull latest code (includes .gitkeep files)
2. Create manually: `mkdir -p uploads/{banners,blogs,projects,projecttree}`

### **If Git Shows Upload Files:**
1. Check .gitignore: `uploads/*` should be there
2. Remove from Git: `git rm --cached uploads/*.jpg`
3. Commit: `git commit -m "Remove uploaded files from Git"`

## ✨ Production Ready!

This setup ensures:
- 🔄 **Zero downtime** for user uploads
- 📈 **Scalable** for large file collections  
- 🛡️ **Safe deployments** with automatic backup/restore
- ⚡ **Fast Git operations** without large files