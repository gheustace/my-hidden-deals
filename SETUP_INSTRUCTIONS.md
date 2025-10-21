# 🚀 Setup Instructions - My Hidden Deals

## Current Status: ✅ Git Initialized & Ready

Your code is committed and ready to push to GitHub!

---

## Step 1: Create GitHub Repository

Go to: **https://github.com/new**

Fill in:
- **Repository name:** `my-hidden-deals`
- **Description:** `My Hidden Deals - Email promo scanner with Nylas integration`
- **Visibility:** Private (or Public - your choice)
- **DO NOT** initialize with README, .gitignore, or license (we already have these)

Click **"Create repository"**

---

## Step 2: Push to GitHub

Run this command in your terminal:

```bash
git push -u origin main
```

If prompted for credentials, you may need to use a Personal Access Token (PAT) instead of your password.

### Create a GitHub PAT (if needed):

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "My Hidden Deals Deploy"
4. Select scopes: `repo` (all repo permissions)
5. Click "Generate token"
6. Copy the token (save it somewhere safe!)
7. Use this token as your password when pushing

---

## Step 3: Deploy to Cloudflare Pages

### Go to: **https://dash.cloudflare.com/pages**

1. Click **"Create a project"**
2. Click **"Connect to Git"**
3. Authorize Cloudflare to access your GitHub
4. Select repository: **`gheustace/my-hidden-deals`**
5. Click **"Begin setup"**

### Build Configuration:

```
Project name: my-hidden-deals
Production branch: main
Framework preset: None
Build command: (leave empty)
Build output directory: /
Root directory: (leave as /)
```

6. Click **"Save and Deploy"**

Wait 1-2 minutes for deployment to complete ⏱️

---

## Step 4: Add Custom Domain

After deployment succeeds:

1. Click **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `mydeals.aone1.ai`
4. Click **"Continue"**
5. Cloudflare will show: "DNS record will be automatically added"
6. Click **"Activate domain"**

Wait 2-3 minutes for DNS and SSL to propagate 🌐

---

## Step 5: Update Backend

Add these to your backend environment variables:

```bash
# Backend .env
ALLOWED_REDIRECT_HOSTS=mydeals.aone1.ai,localhost,staging.aone1.ai
CORS_ORIGINS=https://mydeals.aone1.ai,http://localhost:8000
```

Update your CORS middleware:

```javascript
const corsOptions = {
  origin: [
    'https://mydeals.aone1.ai',
    'http://localhost:8000'
  ],
  credentials: true
};
```

Restart your backend server.

---

## Step 6: Test Your Deployment! 🎉

1. Visit: **https://mydeals.aone1.ai**
2. Enter your email address
3. Click "Find My Deals"
4. Complete OAuth flow
5. Verify deals display correctly

---

## Troubleshooting

### "Repository not found" when pushing

**Solution:** Make sure you created the repository on GitHub first:
https://github.com/new

### Authentication failed when pushing

**Solution:** Use a GitHub Personal Access Token:
1. Create one at: https://github.com/settings/tokens
2. Use the token as your password

### Can't find repository in Cloudflare

**Solution:** 
1. Make sure you authorized Cloudflare to access GitHub
2. You may need to grant access to the specific repository
3. Try refreshing the repository list

### Custom domain shows error

**Solution:**
1. Verify `aone1.ai` is already added to your Cloudflare account
2. Wait 5 minutes for DNS propagation
3. Check DNS records in Cloudflare dashboard

### OAuth redirect fails

**Solution:**
1. Verify backend has `mydeals.aone1.ai` in allowed hosts
2. Check backend CORS configuration
3. Look at browser console for specific errors

---

## Next Steps After Deployment

- Monitor analytics in Cloudflare Pages dashboard
- Set up deployment notifications (optional)
- Enable auto-deploy on push (already configured!)
- Test on mobile devices

---

## Auto-Deploy is Enabled! 🚀

Every time you push to GitHub, Cloudflare automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update design"
git push

# Cloudflare auto-deploys! ✨
```

View deployments at: https://dash.cloudflare.com/pages

---

## Need Help?

- Full Cloudflare guide: `CLOUDFLARE_DEPLOY.md`
- Quick start: `QUICKSTART_CLOUDFLARE.md`
- General deployment: `DEPLOYMENT.md`

---

## Summary

✅ Git initialized  
⏳ Create GitHub repo: https://github.com/new  
⏳ Push code: `git push -u origin main`  
⏳ Deploy on Cloudflare Pages  
⏳ Add custom domain: `mydeals.aone1.ai`  
⏳ Update backend config  
⏳ Test at https://mydeals.aone1.ai  

You're almost there! 🎉

