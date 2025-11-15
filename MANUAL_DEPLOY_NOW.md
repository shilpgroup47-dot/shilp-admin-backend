# 🚀 IMMEDIATE SOLUTION: Manual cPanel Deployment

Since git authentication is blocking push, here's how to deploy immediately:

## Step 1: Manual File Upload to cPanel

### Via cPanel File Manager:
1. **Login to cPanel** → File Manager
2. **Navigate to:** `/home/shilfmfe/server_running/`
3. **Create folder:** `backend.shilpgroup.com` (if not exists)
4. **Upload ALL files** from your local project to this folder

### Important Files to Upload:
- ✅ **src/** (entire folder)
- ✅ **package.json**
- ✅ **package-lock.json** 
- ✅ **.env.example**
- ✅ **auto-deploy.sh**
- ✅ **restart-app.sh**
- ✅ **webhook.php**
- ✅ **.cpanel.yml**
- ✅ **uploads/** (folder structure)

## Step 2: Setup via cPanel Terminal

### Open cPanel Terminal and run:
```bash
# Navigate to your app directory
cd /home/shilfmfe/server_running/backend.shilpgroup.com/

# Make scripts executable
chmod +x auto-deploy.sh
chmod +x restart-app.sh

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Add these to .env:
```
NODE_ENV=production
PORT=8081
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Step 3: Install Dependencies & Start App
```bash
# Install production dependencies
npm ci --production

# Create log directory
mkdir -p /home/shilfmfe/logs

# Start the application
NODE_ENV=production PORT=8081 nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &

# Check if app is running
ps aux | grep "node src/server.js"

# Check logs
tail -f /home/shilfmfe/logs/app.log
```

## Step 4: Test Your API
Visit your backend URL and test endpoints:
- GET /api/health
- POST /api/auth/login
- GET /api/admin/profile

## Fix Git Authentication Later
When you have time, use one of these:

### Option A: GitHub Desktop (Easiest)
1. Download GitHub Desktop app
2. Clone repository through the app
3. Future pushes will work automatically

### Option B: Personal Access Token
1. GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token with repo permissions
3. Use token in git remote URL

**For now, manual upload will get your app running immediately!** 🎉

## Auto-Deploy Setup (After Git Fix)
Once git authentication works:
1. Upload webhook.php to your domain's public_html
2. Add webhook URL in GitHub repository settings
3. Future pushes will auto-deploy to cPanel