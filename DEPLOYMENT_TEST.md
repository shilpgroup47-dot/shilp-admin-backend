# Deployment Test
This file is created to test git push and cPanel auto-deployment.

Date: $(date)
Status: Testing deployment pipeline

## Auto-Deploy Status
- Git push: Testing...
- cPanel webhook: Will trigger after successful push
- Application restart: Automatic via auto-deploy.sh

## Manual Deployment Steps (if auto-deploy fails):
1. SSH to cPanel
2. Navigate to /home/shilfmfe/server_running/backend.shilpgroup.com/
3. Run: ./auto-deploy.sh
4. Check logs: tail -f /home/shilfmfe/logs/app.log