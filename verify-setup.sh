#!/bin/bash

# Git and Deployment Verification Script
echo "🔍 Verifying Git and Deployment Setup"
echo "======================================"

# Check uploads directory structure
echo "📁 Checking uploads directory structure..."
if [ -d "uploads" ]; then
    echo "✅ uploads/ directory exists"
    for dir in banners blogs projects projecttree; do
        if [ -f "uploads/$dir/.gitkeep" ]; then
            echo "✅ uploads/$dir/.gitkeep exists and tracked"
        else
            echo "❌ uploads/$dir/.gitkeep missing"
        fi
    done
else
    echo "❌ uploads/ directory missing"
fi

# Check if uploads structure is in Git
echo ""
echo "🔍 Checking Git tracking for uploads..."
UPLOADS_IN_GIT=$(git ls-files uploads/ | wc -l)
if [ "$UPLOADS_IN_GIT" -gt 0 ]; then
    echo "✅ uploads directory structure is tracked in Git"
    git ls-files uploads/
else
    echo "❌ uploads directory structure not tracked in Git"
fi

# Check package-lock.json
echo ""
echo "🔍 Checking package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
    if git ls-files | grep -q "package-lock.json"; then
        echo "✅ package-lock.json is tracked in Git"
    else
        echo "❌ package-lock.json not tracked in Git"
    fi
else
    echo "❌ package-lock.json missing"
fi

# Check deployment scripts
echo ""
echo "🔍 Checking deployment scripts..."
for script in auto-deploy.sh restart-app.sh deploy.sh; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "✅ $script exists and is executable"
        else
            echo "⚠️ $script exists but not executable"
            chmod +x "$script"
            echo "🔧 Made $script executable"
        fi
    else
        echo "❌ $script missing"
    fi
done

# Check webhook handler
echo ""
echo "🔍 Checking webhook handler..."
if [ -f "webhook.php" ]; then
    echo "✅ webhook.php exists"
else
    echo "❌ webhook.php missing"
fi

# Check GitHub Actions workflow
echo ""
echo "🔍 Checking GitHub Actions workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions deploy.yml exists"
else
    echo "❌ GitHub Actions deploy.yml missing"
fi

# Check .gitignore configuration
echo ""
echo "🔍 Checking .gitignore configuration..."
if grep -q "uploads/\*" .gitignore && grep -q "!uploads/\*/.gitkeep" .gitignore; then
    echo "✅ .gitignore correctly configured for uploads"
else
    echo "❌ .gitignore uploads configuration needs fixing"
fi

if grep -q "package-lock.json" .gitignore; then
    echo "⚠️ package-lock.json is ignored (should be tracked for production)"
else
    echo "✅ package-lock.json is tracked (good for production)"
fi

# Summary
echo ""
echo "📊 Summary:"
echo "==========="
echo "Ready for Git push: $([ "$UPLOADS_IN_GIT" -gt 0 ] && [ -f "package-lock.json" ] && echo "✅ YES" || echo "❌ NO")"
echo "Ready for cPanel deployment: $([ -f "auto-deploy.sh" ] && [ -x "auto-deploy.sh" ] && echo "✅ YES" || echo "❌ NO")"
echo "Ready for GitHub Actions: $([ -f ".github/workflows/deploy.yml" ] && echo "✅ YES" || echo "❌ NO")"

echo ""
echo "🚀 Next steps:"
echo "1. git push origin main"
echo "2. Setup webhook in GitHub: https://backend.shilpgroup.com/webhook.php"
echo "3. Deploy to cPanel following CPANEL_SHILFMFE_SETUP.md"