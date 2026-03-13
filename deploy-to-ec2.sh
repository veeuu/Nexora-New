#!/bin/bash

# Nexora EC2 Deployment Script
# This script automates the deployment process on EC2

set -e  # Exit on any error

echo "🚀 Starting Nexora Deployment..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "\n${YELLOW}Step 1: Pulling latest code from repository...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"

# Step 2: Navigate to frontend
echo -e "\n${YELLOW}Step 2: Navigating to frontend directory...${NC}"
cd frontend
echo -e "${GREEN}✓ In frontend directory${NC}"

# Step 3: Install dependencies (if needed)
echo -e "\n${YELLOW}Step 3: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed"
fi
echo -e "${GREEN}✓ Dependencies ready${NC}"

# Step 4: Copy logos
echo -e "\n${YELLOW}Step 4: Copying logos to public folder...${NC}"
npm run copy-logos
echo -e "${GREEN}✓ Logos copied${NC}"

# Step 5: Build frontend
echo -e "\n${YELLOW}Step 5: Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Step 6: Verify logos in dist
echo -e "\n${YELLOW}Step 6: Verifying logos in dist folder...${NC}"
LOGO_COUNT=$(ls -1 dist/logos 2>/dev/null | wc -l)
echo "Found $LOGO_COUNT logo files"
if [ "$LOGO_COUNT" -lt 300 ]; then
    echo -e "${RED}⚠️  Warning: Expected ~343 logos, found only $LOGO_COUNT${NC}"
else
    echo -e "${GREEN}✓ Logo count looks good${NC}"
fi

# Step 7: Fix permissions
echo -e "\n${YELLOW}Step 7: Fixing file permissions...${NC}"
chmod -R 755 dist/logos 2>/dev/null || true
chmod 644 dist/logos/* 2>/dev/null || true
echo -e "${GREEN}✓ Permissions fixed${NC}"

# Step 8: Check sample logos
echo -e "\n${YELLOW}Step 8: Checking sample logos...${NC}"
SAMPLE_LOGOS=("AWS.png" "Azure.png" "OpenAI.png" "MongoDB.png" "Salesforce.png")
for logo in "${SAMPLE_LOGOS[@]}"; do
    if [ -f "dist/logos/$logo" ]; then
        echo -e "${GREEN}✓${NC} $logo exists"
    else
        echo -e "${RED}✗${NC} $logo missing"
    fi
done

# Step 9: Nginx configuration reminder
echo -e "\n${YELLOW}Step 9: Nginx Configuration${NC}"
echo "Please ensure your nginx config serves from the dist folder."
echo "See nginx-nexora-production.conf for the correct configuration."
echo ""
echo "To update nginx config:"
echo "  sudo nano /etc/nginx/sites-available/nexora.conf"
echo "  OR"
echo "  sudo nano /etc/nginx/conf.d/nexora.conf"
echo ""
echo "Then test and reload:"
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"

# Step 10: Test logo access
echo -e "\n${YELLOW}Step 10: Testing logo access...${NC}"
echo "Testing: https://nexora.proplusdata.co/logos/AWS.png"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nexora.proplusdata.co/logos/AWS.png 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Logo accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Logo not accessible (HTTP $HTTP_CODE)${NC}"
    echo "You may need to update nginx config and reload"
fi

# Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update nginx config if needed (see nginx-nexora-production.conf)"
echo "2. Reload nginx: sudo systemctl reload nginx"
echo "3. Clear browser cache (Ctrl+Shift+R)"
echo "4. Test the application: https://nexora.proplusdata.co"
echo ""
echo "Troubleshooting:"
echo "- Check nginx logs: sudo tail -f /var/log/nginx/nexora-ssl-error.log"
echo "- Check backend logs: pm2 logs nexora-backend"
echo "- Verify logo count: ls dist/logos | wc -l"
echo ""
