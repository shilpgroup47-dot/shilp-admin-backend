# 🚨 MongoDB Connection Issues - Solutions

## Current Problem: 
`ENOTFOUND _mongodb._tcp.cluster0.chfkuy8.mongodb.net`

This means the MongoDB cluster hostname cannot be resolved.

## ✅ Immediate Solutions:

### 1. Check MongoDB Atlas Dashboard
- Login to https://cloud.mongodb.com
- Verify cluster status (should be "Active", not "Paused")
- Check cluster name matches: `cluster0`

### 2. Get Fresh Connection String
In MongoDB Atlas:
1. Cluster → Connect → Connect your application
2. Select Node.js driver
3. Copy the new connection string
4. Replace in .env file

### 3. Verify Network Access
In MongoDB Atlas:
1. Network Access tab
2. Add IP Address: `0.0.0.0/0` (allow all for now)
3. Save and wait 2-3 minutes

### 4. Check Database User
In MongoDB Atlas:
1. Database Access tab  
2. Verify user: `shilpgroup47_db_user` exists
3. Check password is correct

## 🆘 Emergency Local Database (Development Only)

If Atlas is down, use local MongoDB:

### Install MongoDB locally:
```bash
# macOS with Homebrew
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Use local connection:
```env
# In .env file
DATABASE_URL=mongodb://localhost:27017/shilpadmin
```

## ✨ Working Connection String Format:
```
mongodb+srv://username:password@clustername.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

## 🔍 Debug Commands:
```bash
# Test DNS resolution
nslookup cluster0.chfkuy8.mongodb.net

# Test connectivity  
ping cluster0.chfkuy8.mongodb.net

# Check if different DNS server helps
nslookup cluster0.chfkuy8.mongodb.net 8.8.8.8
```