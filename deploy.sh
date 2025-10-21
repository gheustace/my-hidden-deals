#!/bin/bash

# Deployment script for My Hidden Deals
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="my-hidden-deals"

echo -e "${GREEN}🚀 Deploying My Hidden Deals to ${ENVIRONMENT}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if required files exist
echo "📋 Checking required files..."
REQUIRED_FILES=("index.html" "connected.html" "styles.css" "app.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file found"
    else
        print_error "$file not found!"
        exit 1
    fi
done
echo ""

# Validate HTML
echo "🔍 Validating HTML..."
if command -v tidy &> /dev/null; then
    for html in index.html connected.html; do
        if tidy -q -e "$html" 2>&1 | grep -q "Error"; then
            print_warning "$html has validation warnings (non-critical)"
        else
            print_status "$html is valid"
        fi
    done
else
    print_warning "HTML Tidy not found, skipping validation"
fi
echo ""

# Check for JavaScript errors (basic)
echo "🔍 Checking JavaScript..."
if command -v node &> /dev/null; then
    if node -c app.js 2>&1 | grep -q "SyntaxError"; then
        print_error "JavaScript syntax errors found!"
        exit 1
    else
        print_status "JavaScript syntax is valid"
    fi
else
    print_warning "Node.js not found, skipping JS validation"
fi
echo ""

# Select deployment method
echo "📦 Select deployment method:"
echo "1) Cloudflare Pages (Recommended)"
echo "2) Vercel"
echo "3) Netlify"
echo "4) S3/CloudFront"
echo "5) Manual (rsync to server)"
echo "6) Local test server"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Cloudflare Pages..."
        if command -v wrangler &> /dev/null; then
            # Check if logged in
            if ! wrangler whoami &> /dev/null; then
                echo "Please login to Cloudflare first..."
                wrangler login
            fi
            
            echo "Deploying to Cloudflare Pages..."
            wrangler pages deploy . --project-name=my-hidden-deals
            
            print_status "Deployed to Cloudflare Pages!"
            echo ""
            print_warning "Next steps:"
            echo "  1. Go to Cloudflare Pages dashboard"
            echo "  2. Add custom domain: mydeals.aone1.ai"
            echo "  3. DNS and SSL will be configured automatically"
        else
            print_error "Wrangler CLI not found. Install: npm i -g wrangler"
            echo ""
            echo "Alternative: Deploy via Cloudflare Dashboard"
            echo "  1. Push code to GitHub"
            echo "  2. Go to https://dash.cloudflare.com/pages"
            echo "  3. Create new project from GitHub"
            echo "  4. Select repository and deploy"
            echo ""
            echo "See CLOUDFLARE_DEPLOY.md for detailed instructions"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            # Create vercel.json if it doesn't exist
            if [ ! -f "vercel.json" ]; then
                cat > vercel.json << EOF
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/connected", "destination": "/connected.html" }
  ]
}
EOF
                print_status "Created vercel.json"
            fi
            
            vercel --prod
            print_status "Deployed to Vercel!"
        else
            print_error "Vercel CLI not found. Install: npm i -g vercel"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "🚀 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            # Create _redirects if it doesn't exist
            if [ ! -f "_redirects" ]; then
                cat > _redirects << EOF
/connected /connected.html 200
EOF
                print_status "Created _redirects"
            fi
            
            netlify deploy --prod --dir=.
            print_status "Deployed to Netlify!"
        else
            print_error "Netlify CLI not found. Install: npm i -g netlify-cli"
            exit 1
        fi
        ;;
        
    4)
        echo ""
        echo "🚀 Deploying to S3..."
        read -p "Enter S3 bucket name: " bucket_name
        read -p "Enter CloudFront distribution ID (optional): " dist_id
        
        if command -v aws &> /dev/null; then
            aws s3 sync . s3://$bucket_name \
                --exclude ".git/*" \
                --exclude "*.sh" \
                --exclude "*.md" \
                --exclude "node_modules/*"
            
            print_status "Files synced to S3"
            
            if [ ! -z "$dist_id" ]; then
                echo "Invalidating CloudFront cache..."
                aws cloudfront create-invalidation \
                    --distribution-id $dist_id \
                    --paths "/*"
                print_status "CloudFront cache invalidated"
            fi
            
            print_status "Deployed to S3!"
        else
            print_error "AWS CLI not found. Install: pip install awscli"
            exit 1
        fi
        ;;
        
    5)
        echo ""
        echo "🚀 Deploying via rsync..."
        read -p "Enter server address (user@host): " server
        read -p "Enter remote path (e.g., /var/www/mydeals): " remote_path
        
        if command -v rsync &> /dev/null; then
            rsync -avz --exclude '.git' \
                --exclude '*.sh' \
                --exclude '*.md' \
                --exclude 'node_modules' \
                index.html connected.html styles.css app.js \
                $server:$remote_path
            
            print_status "Files synced to server!"
            
            echo ""
            print_warning "Remember to:"
            echo "  1. Restart your web server if needed"
            echo "  2. Verify SSL certificate is valid"
            echo "  3. Test the deployment at https://mydeals.aone1.ai"
        else
            print_error "rsync not found"
            exit 1
        fi
        ;;
        
    6)
        echo ""
        echo "🧪 Starting local test server..."
        echo ""
        print_status "Server running at: http://localhost:8000"
        print_warning "Press Ctrl+C to stop"
        echo ""
        
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            print_error "Python not found"
            exit 1
        fi
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Verify deployment at https://mydeals.aone1.ai"
echo "  2. Test OAuth flow end-to-end"
echo "  3. Check browser console for any errors"
echo "  4. Monitor backend logs for API issues"
echo ""
echo "📚 Documentation: DEPLOYMENT.md"
echo ""

