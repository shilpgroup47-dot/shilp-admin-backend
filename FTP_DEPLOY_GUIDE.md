# 🚀 FTP DEPLOYMENT GUIDE - IMMEDIATE SOLUTION

## Your FTP Details (From cPanel Screenshot):
- **Server:** ftp.shilpgroup.com
- **Username:** shilfmfe@backend.shilpgroup.com  
- **Path:** /home/shilfmfe/server_running/backend.shilpgroup.com
- **Password:** [Your FTP password from cPanel]

## OPTION 1: Command Line FTP (Quick)
```bash
./ftp-deploy.sh
```
Enter your FTP password when prompted.

## OPTION 2: FTP Client (Recommended)

### Using FileZilla (Free):
1. **Download FileZilla** from filezilla-project.org
2. **Connect with these details:**
   - Host: `ftp.shilpgroup.com`
   - Username: `shilfmfe@backend.shilpgroup.com`
   - Password: [Your FTP password]
   - Port: `21`

3. **Navigate to:** `/home/shilfmfe/server_running/backend.shilpgroup.com/`
4. **Upload these files/folders:**
   ```
   📁 src/                    (entire folder)
   📄 package.json
   📄 package-lock.json
   📄 .env.example
   📄 auto-deploy.sh
   📄 restart-app.sh
   📄 webhook.php
   📄 .cpanel.yml
   📁 uploads/               (folder structure)
   ```

### Using Cyberduck (Mac):
1. **Download Cyberduck** from cyberduck.io
2. **Click "FTP Configuration File"** button in your cPanel
3. **Open downloaded config** in Cyberduck
4. **Upload all project files**

## OPTION 3: cPanel File Manager
1. **Go to cPanel → File Manager**
2. **Navigate to:** `/home/shilfmfe/server_running/`
3. **Create folder:** `backend.shilpgroup.com` (if not exists)
4. **Upload all files** using File Manager interface

## After Upload - Setup Commands:

### Login to cPanel Terminal and run:
```bash
# Navigate to app directory
cd /home/shilfmfe/server_running/backend.shilpgroup.com/

# Make scripts executable
chmod +x auto-deploy.sh restart-app.sh

# Create production environment
cp .env.example .env

# Edit .env file with your settings
nano .env
```

### Add to .env:
```
NODE_ENV=production
PORT=8081
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-here
```

### Install and Start:
```bash
# Install dependencies
npm ci --production

# Create log directory
mkdir -p /home/shilfmfe/logs

# Start application
NODE_ENV=production PORT=8081 nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &

# Verify it's running
ps aux | grep "node src/server.js"
tail -f /home/shilfmfe/logs/app.log
```

## Success Check:
- ✅ Files uploaded via FTP
- ✅ Dependencies installed
- ✅ App running on port 8081
- ✅ Logs show no errors
- ✅ API endpoints accessible

**Choose any option above - FTP upload will get your app deployed immediately!** 🎉