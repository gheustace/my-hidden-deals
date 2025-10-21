# Deployment Guide: My Hidden Deals

## Hosting at mydeals.aone1.ai

This guide covers deploying the frontend to `mydeals.aone1.ai` and ensuring proper integration with the backend at `staging.aone1.ai`.

---

## Prerequisites

- [ ] Domain `mydeals.aone1.ai` configured with DNS
- [ ] SSL certificate for HTTPS (required for OAuth)
- [ ] Web server (Nginx, Apache, or static hosting service)
- [ ] Backend at `staging.aone1.ai` running and accessible

---

## Backend Configuration

### 1. Update Allowed Redirect Hosts

Add `mydeals.aone1.ai` to your backend's allowed redirect hosts:

```bash
# In your backend .env or configuration
ALLOWED_REDIRECT_HOSTS=mydeals.aone1.ai,localhost,staging.aone1.ai
```

### 2. Update Nylas Dashboard

Go to [Nylas Dashboard](https://dashboard.nylas.com) and add:

```
https://staging.aone1.ai/api/nylas/callback
```

to your authorized redirect URIs.

### 3. Update CORS Settings

Ensure your backend allows requests from `mydeals.aone1.ai`:

```javascript
// Backend CORS configuration
const corsOptions = {
  origin: [
    'https://mydeals.aone1.ai',
    'https://staging.aone1.ai',
    'http://localhost:8000'
  ],
  credentials: true
};
```

---

## Frontend Deployment

### Option 1: Static Hosting (Recommended)

The application is a static website and can be deployed to any static host:

#### **Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/connected", "destination": "/connected.html" }
  ]
}
```

#### **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

Add `_redirects` file:
```
/connected /connected.html 200
```

#### **AWS S3 + CloudFront**
```bash
# Sync files to S3
aws s3 sync . s3://mydeals-bucket --exclude ".git/*"

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### **nginx**
```nginx
server {
    listen 443 ssl http2;
    server_name mydeals.aone1.ai;
    
    ssl_certificate /etc/ssl/certs/mydeals.aone1.ai.crt;
    ssl_certificate_key /etc/ssl/private/mydeals.aone1.ai.key;
    
    root /var/www/mydeals;
    index index.html;
    
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name mydeals.aone1.ai;
    return 301 https://$server_name$request_uri;
}
```

---

## Deployment Steps

### 1. **Prepare Files**

Ensure all files are ready:
```
A1DemoConnect/
├── index.html
├── connected.html
├── styles.css
├── app.js
└── README.md
```

### 2. **Upload to Server**

```bash
# Using SCP
scp -r index.html connected.html styles.css app.js user@server:/var/www/mydeals/

# Or using rsync
rsync -avz --exclude '.git' . user@server:/var/www/mydeals/
```

### 3. **Verify DNS**

```bash
# Check DNS resolution
dig mydeals.aone1.ai

# Should point to your server's IP
```

### 4. **Test SSL**

```bash
# Verify SSL certificate
curl -I https://mydeals.aone1.ai

# Should return 200 OK with valid SSL
```

### 5. **Test OAuth Flow**

1. Visit `https://mydeals.aone1.ai`
2. Enter email and click "Find My Deals"
3. Should redirect to Nylas OAuth
4. After auth, should redirect to `https://mydeals.aone1.ai/connected.html?grant_id=...`
5. Verify deals load correctly

---

## Environment-Specific Configuration

The application **automatically detects** the environment based on `window.location.origin`, so no code changes are needed between environments:

```javascript
// app.js - Already configured
const redirectUrl = `${window.location.origin}/connected.html`;
```

This means:
- Local dev: `http://localhost:8000/connected.html`
- Production: `https://mydeals.aone1.ai/connected.html`

---

## DNS Configuration

### A Record (for direct server hosting)
```
Type: A
Name: mydeals
Value: YOUR_SERVER_IP
TTL: 3600
```

### CNAME (for hosting platforms)
```
Type: CNAME
Name: mydeals
Value: your-project.vercel.app (or similar)
TTL: 3600
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d mydeals.aone1.ai

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### Using Cloudflare (Recommended)

1. Add `aone1.ai` to Cloudflare
2. Add DNS record for `mydeals`
3. Enable "Full (strict)" SSL mode
4. Enable automatic HTTPS rewrites
5. Certificate is automatically managed

---

## Monitoring & Analytics

### Add Google Analytics (Optional)

Add to `<head>` in both `index.html` and `connected.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking with Sentry (Optional)

Add to `app.js`:

```javascript
// Initialize Sentry
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: window.location.hostname === 'localhost' ? 'development' : 'production'
});
```

---

## Troubleshooting

### Issue: OAuth redirect fails

**Check:**
1. Backend allows `mydeals.aone1.ai` in redirect hosts
2. Nylas dashboard has correct callback URI
3. SSL certificate is valid
4. No mixed content warnings (HTTP/HTTPS)

**Solution:**
```bash
# Check backend logs
tail -f /var/log/backend/error.log

# Verify CORS headers
curl -I https://staging.aone1.ai/api/nylas/auth \
  -H "Origin: https://mydeals.aone1.ai"
```

### Issue: grant_id not found on connected page

**Check:**
1. URL has `?grant_id=...` parameter
2. Backend callback is redirecting correctly
3. Browser console for JavaScript errors

**Debug:**
```javascript
// Add to app.js temporarily
console.log('URL params:', window.location.search);
console.log('grant_id:', new URLSearchParams(window.location.search).get('grant_id'));
```

### Issue: API requests fail (CORS errors)

**Check:**
1. Backend CORS configuration includes `mydeals.aone1.ai`
2. Requests are going to `https://staging.aone1.ai` (not HTTP)
3. Browser console for specific CORS error

**Solution:**
Update backend CORS middleware to allow `mydeals.aone1.ai`

### Issue: Deals not loading

**Check:**
1. Network tab in browser dev tools
2. API response status codes
3. Console for JavaScript errors

**Debug:**
```javascript
// Check API response
fetch('https://staging.aone1.ai/api/promos?grantId=test&limit=1')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## Performance Optimization

### Enable Gzip Compression

```nginx
# Add to nginx.conf
gzip on;
gzip_types text/css application/javascript application/json;
gzip_min_length 1000;
```

### Add Cache Headers

```nginx
location ~* \.(css|js)$ {
    expires 7d;
    add_header Cache-Control "public, must-revalidate";
}
```

### Minify Assets (Optional)

```bash
# Install minification tools
npm install -g html-minifier clean-css-cli uglify-js

# Minify HTML
html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html

# Minify CSS
cleancss -o styles.min.css styles.css

# Minify JS
uglifyjs app.js -o app.min.js -c -m
```

Then update HTML to reference `.min.css` and `.min.js` files.

---

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Security headers configured (X-Frame-Options, CSP, etc.)
- [ ] No API keys or secrets in frontend code
- [ ] CORS properly configured on backend
- [ ] Content Security Policy (CSP) configured
- [ ] Regular dependency updates
- [ ] Rate limiting on backend API endpoints

---

## Rollback Plan

If deployment has issues:

1. **Keep previous version:**
   ```bash
   # Before deploying
   cp -r /var/www/mydeals /var/www/mydeals.backup
   ```

2. **Quick rollback:**
   ```bash
   # Restore previous version
   rm -rf /var/www/mydeals
   mv /var/www/mydeals.backup /var/www/mydeals
   ```

3. **DNS rollback:**
   - Update DNS to point to old server
   - Wait for TTL to expire (usually 5 minutes)

---

## Post-Deployment Verification

### Automated Tests

```bash
#!/bin/bash
# test-deployment.sh

BASE_URL="https://mydeals.aone1.ai"

# Test homepage loads
curl -f $BASE_URL > /dev/null || exit 1

# Test connected page loads
curl -f $BASE_URL/connected.html > /dev/null || exit 1

# Test assets load
curl -f $BASE_URL/styles.css > /dev/null || exit 1
curl -f $BASE_URL/app.js > /dev/null || exit 1

echo "✅ All tests passed!"
```

### Manual Checks

- [ ] Homepage loads at `https://mydeals.aone1.ai`
- [ ] Email form works
- [ ] OAuth flow completes successfully
- [ ] Deals display correctly on `/connected` page
- [ ] Filters work
- [ ] Copy code functionality works
- [ ] "View Deal" links work
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] SSL certificate is valid

---

## Support

For deployment issues:
1. Check backend logs at `staging.aone1.ai`
2. Review browser console for frontend errors
3. Verify DNS and SSL configuration
4. Test API endpoints directly with curl
5. Check Nylas dashboard for OAuth issues

---

## Summary

**Quick deployment checklist:**
1. ✅ Configure backend to allow `mydeals.aone1.ai`
2. ✅ Upload files to web server
3. ✅ Configure SSL certificate
4. ✅ Point DNS to server
5. ✅ Test OAuth flow end-to-end
6. ✅ Monitor for errors

The application is already production-ready with dynamic environment detection!

