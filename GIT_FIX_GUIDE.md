# Git Push Authentication Fix Guide

## Problem
Git push failing with authentication error - code not reaching GitHub and cPanel

## Quick Fix Options

### Option 1: Use GitHub Desktop (Easiest)
1. Install GitHub Desktop app
2. Clone the repository through GitHub Desktop
3. Make changes and commit through the app
4. Push will work automatically

### Option 2: Personal Access Token (Recommended)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Give it repo permissions
4. Copy the token
5. Use this command:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/shilpgroup47-dot/shilp-admin-backend.git
```

### Option 3: GitHub CLI (Simplest)
1. Install GitHub CLI: `brew install gh`
2. Run: `gh auth login`
3. Follow the prompts
4. Then push normally: `git push origin main`

### Option 4: SSH Key Setup
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your-email@example.com"`
2. Add to SSH agent: `ssh-add ~/.ssh/id_ed25519`
3. Copy public key: `cat ~/.ssh/id_ed25519.pub`
4. Add key to GitHub → Settings → SSH and GPG keys

## Current Status
- ✅ Code ready for deployment
- ❌ Git authentication blocking push
- ⏳ cPanel auto-deploy waiting for push

## Manual cPanel Deployment (If git fails)
If you can't fix git authentication right now:

1. **Upload files manually via cPanel File Manager**
   - Go to cPanel File Manager
   - Navigate to `/home/shilfmfe/server_running/backend.shilpgroup.com/`
   - Upload all files from your local project

2. **Run deployment script**
   - Open cPanel Terminal
   - Run: `cd /home/shilfmfe/server_running/backend.shilpgroup.com/`
   - Run: `chmod +x auto-deploy.sh`
   - Run: `./auto-deploy.sh`

3. **Check if app is running**
   - Run: `ps aux | grep "node src/server.js"`
   - Check logs: `tail -f /home/shilfmfe/logs/app.log`

## Test Commands After Authentication Fix
```bash
# Test git push
git push origin main

# This should trigger:
# 1. GitHub Actions build check
# 2. cPanel webhook (if configured)
# 3. Auto-deployment via auto-deploy.sh
```

Choose any option above to fix git authentication, then push will work and cPanel will auto-update!