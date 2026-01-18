# Production Deployment Guide

This guide will walk you through deploying Property-Connect to production with minimal cost, including hosting, database, image storage, and OAuth configuration.

## ⚡ Quick Start Summary

**Total Time**: ~30-45 minutes  
**Total Cost**: ~$5-7/month

### Quick Steps:
1. ✅ **Cloudinary Setup** (5 min) - Sign up and get credentials
2. ✅ **Railway Deployment** (10 min) - Deploy your app
3. ✅ **Database Setup** (5 min) - Run migrations
4. ✅ **OAuth Configuration** (10 min) - Update Google & setup Facebook
5. ✅ **Environment Variables** (5 min) - Add all secrets
6. ✅ **Test & Deploy** (5 min) - Verify everything works

**Already Done For You:**
- ✅ Cloudinary integration code (automatically uses Cloudinary when configured)
- ✅ Railway configuration file (`railway.json`)
- ✅ Production-ready build setup

---

## 🎯 Recommended Stack (Minimal Cost)

**Total Estimated Cost: ~$5-7/month**

1. **Hosting**: Railway.app ($5/month) - Includes PostgreSQL, persistent storage, custom domains
2. **Image Storage**: Cloudinary (Free tier: 25GB storage, 25GB bandwidth/month)
3. **Domain**: Namecheap or Cloudflare ($10-15/year) - Optional but recommended

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up Cloudinary for Image Storage](#step-1-set-up-cloudinary-for-image-storage)
3. [Step 2: Deploy to Railway](#step-2-deploy-to-railway)
4. [Step 3: Configure PostgreSQL Database](#step-3-configure-postgresql-database)
5. [Step 4: Update OAuth Settings for Production](#step-4-update-oauth-settings-for-production)
6. [Step 5: Set Up Custom Domain (Optional)](#step-5-set-up-custom-domain-optional)
7. [Step 6: Configure Facebook OAuth](#step-6-configure-facebook-oauth)
8. [Step 7: Final Configuration & Testing](#step-7-final-configuration--testing)

---

## Prerequisites

- GitHub account (for Railway deployment)
- Google Cloud Console access (already configured)
- Facebook Developer account (for Facebook OAuth)
- Domain name (optional, but recommended)

---

## Step 1: Set Up Cloudinary for Image Storage

Since Railway's file system is ephemeral, we'll use Cloudinary for persistent image storage.

### 1.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. After signup, you'll be taken to your dashboard

### 1.2 Get Your Cloudinary Credentials

From your Cloudinary dashboard, copy these values:
- **Cloud Name** (e.g., `dxyz123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

**Keep these secure** - you'll add them to Railway environment variables later.

### 1.3 Cloudinary Already Installed

✅ **Good news!** The Cloudinary package is already installed and configured in your project. The code automatically uses Cloudinary when the environment variables are set.

**No installation needed** - just set the environment variables in Railway!

---

## Step 2: Deploy to Railway

Railway is the most cost-effective option that includes everything you need.

### 2.1 Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email

### 2.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select your `Property-Connect` repository
5. Railway will automatically detect your project

### 2.3 Configure Build Settings

Railway should auto-detect your project, but verify these settings:

1. Go to your project → **Settings** → **Build**
2. Ensure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (root)

### 2.4 Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database automatically
4. The database URL will be available as an environment variable: `DATABASE_URL`

**Note**: Railway automatically sets `DATABASE_URL` - you don't need to manually configure it.

---

## Step 3: Configure PostgreSQL Database

### 3.1 Push Database Schema

After deployment, you'll need to run migrations. Railway provides a way to do this:

**Option A: Using Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Run database migrations:
   ```bash
   railway run npm run db:push
   ```

**Option B: Using Railway Dashboard**

1. Go to your service → **Variables** tab
2. Add a temporary variable: `RUN_MIGRATIONS=true`
3. Modify your `package.json` start script temporarily to run migrations first
4. Or use Railway's **Deploy Logs** to run commands

---

## Step 4: Update OAuth Settings for Production

### 4.1 Update Google OAuth Settings

Since you already have Google OAuth configured, you just need to add your production domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `https://your-app-name.up.railway.app` (Railway's default domain)
   - `https://yourdomain.com` (if using custom domain)
6. Under **Authorized redirect URIs**, add:
   - `https://your-app-name.up.railway.app/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback` (if using custom domain)
7. Click **Save**

### 4.2 Get Your Production URL

1. In Railway dashboard, go to your service
2. Click on **Settings** → **Networking**
3. Copy your **Public Domain** (e.g., `property-connect-production.up.railway.app`)
4. Use this URL for OAuth callbacks

---

## Step 5: Set Up Custom Domain (Optional)

### 5.1 Purchase Domain (if needed)

Recommended providers:
- **Namecheap**: ~$10-15/year
- **Cloudflare**: ~$8-10/year (also provides free CDN)
- **Google Domains**: ~$12/year

### 5.2 Configure Domain in Railway

1. In Railway dashboard → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `propertyconnect.com`)
4. Railway will provide DNS records to add

### 5.3 Configure DNS

Add these DNS records in your domain provider:

**For Root Domain (propertyconnect.com):**
- Type: `CNAME`
- Name: `@` or leave blank
- Value: `your-app-name.up.railway.app`

**For WWW (www.propertyconnect.com):**
- Type: `CNAME`
- Name: `www`
- Value: `your-app-name.up.railway.app`

**Note**: DNS propagation can take 24-48 hours, but usually happens within minutes.

### 5.4 Update OAuth Callbacks

After your domain is configured, update OAuth callbacks:
- Google: Add `https://yourdomain.com/api/auth/google/callback`
- Facebook: Add `https://yourdomain.com/api/auth/facebook/callback`

---

## Step 6: Configure Facebook OAuth

### 6.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Consumer"** as the app type
4. Fill in:
   - **App Display Name**: `Property-Connect` (or your preferred name)
   - **App Contact Email**: Your email address
5. Click **"Create App"**

### 6.2 Add Facebook Login Product

1. In your app dashboard, find **"Add a Product"**
2. Click **"Set Up"** on **"Facebook Login"**
3. Choose **"Web"** as the platform
4. Enter your site URL:
   - Development: `http://localhost:5000`
   - Production: `https://your-app-name.up.railway.app` or `https://yourdomain.com`
5. Click **"Save"**

### 6.3 Configure Facebook App Settings

1. Go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret** (click "Show" to reveal secret)
3. Add **App Domains**:
   - `localhost` (for development)
   - `your-app-name.up.railway.app` (Railway domain)
   - `yourdomain.com` (if using custom domain)
4. Add **Website**:
   - Site URL: `https://your-app-name.up.railway.app` or `https://yourdomain.com`
5. Click **"Save Changes"**

### 6.4 Configure Valid OAuth Redirect URIs

1. Go to **Facebook Login** → **Settings**
2. Under **"Valid OAuth Redirect URIs"**, add:
   - `http://localhost:5000/api/auth/facebook/callback` (for development)
   - `https://your-app-name.up.railway.app/api/auth/facebook/callback` (Railway)
   - `https://yourdomain.com/api/auth/facebook/callback` (custom domain)
3. Click **"Save Changes"**

### 6.5 Set App to Live Mode (Important!)

By default, Facebook apps are in "Development Mode" and only work for test users:

1. Go to **Settings** → **Basic**
2. Scroll to **"App Review"** section
3. Toggle **"Make [Your App Name] public?"** to **Yes**
4. You may need to complete App Review for certain permissions, but basic login should work

**Note**: For testing, you can add test users in **Roles** → **Test Users** without making the app public.

---

## Step 7: Final Configuration & Testing

### 7.1 Set Environment Variables in Railway

Go to your Railway service → **Variables** tab and add:

```env
# Database (automatically set by Railway PostgreSQL)
DATABASE_URL=<automatically-set-by-railway>

# Session Secret (generate a new one for production)
SESSION_SECRET=<generate-new-secret-using-command-below>

# Base URL (your production URL)
BASE_URL=https://your-app-name.up.railway.app
# OR if using custom domain:
BASE_URL=https://yourdomain.com

# Port (Railway sets this automatically)
PORT=<automatically-set-by-railway>

# Google OAuth (already configured)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (new)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7.2 Code Already Updated!

✅ **Good news!** The code has already been updated to support Cloudinary. The application will:
- Use Cloudinary for image storage when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set
- Fall back to local storage for development when Cloudinary is not configured

**No code changes needed** - just install the dependency and set the environment variables!

### 7.3 Deploy

1. Railway automatically deploys on every push to your main branch
2. Or manually trigger deployment: **Deployments** → **"Redeploy"**
3. Check deployment logs for any errors

### 7.4 Test Your Deployment

1. Visit your Railway URL or custom domain
2. Test Google OAuth login
3. Test Facebook OAuth login
4. Test image upload (should use Cloudinary)
5. Test creating a property listing
6. Verify database operations work

---

## 🔧 Installation Status

### ✅ Cloudinary Already Installed

The Cloudinary package is already installed in your project! The code has been updated to support Cloudinary automatically.

**What you need to do:**
- Just set the Cloudinary environment variables in Railway (see Step 7.1)
- No additional installation needed!

### How It Works

The application automatically detects if Cloudinary is configured:
- **If Cloudinary credentials are set**: Images are uploaded to Cloudinary and URLs are returned
- **If Cloudinary is not configured**: Falls back to local file storage (for development)

This means:
- ✅ Works locally without Cloudinary (development)
- ✅ Works in production with Cloudinary (just set the env vars)
- ✅ No code changes needed - already implemented!

---

## 📊 Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Railway (Hosting + PostgreSQL) | Starter | $5/month |
| Cloudinary | Free Tier | $0/month |
| Domain (optional) | Annual | ~$1/month |
| **Total** | | **~$5-6/month** |

**Railway Free Tier Alternative:**
- Railway offers $5 free credit monthly
- If you stay within limits, could be free
- But $5/month is more reliable for production

---

## 🔒 Security Checklist

- [ ] Use strong `SESSION_SECRET` (32+ characters, random)
- [ ] Never commit `.env` file to Git
- [ ] Use HTTPS (Railway provides automatically)
- [ ] Keep OAuth secrets secure
- [ ] Regularly update dependencies
- [ ] Set up monitoring/alerts (Railway provides basic monitoring)

---

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Railway
- Check Railway PostgreSQL service is running
- Ensure migrations ran successfully

### OAuth Redirect Errors

- Verify `BASE_URL` matches your actual domain
- Check OAuth callback URLs match exactly (including https)
- Ensure domain is added to OAuth provider settings

### Image Upload Not Working

- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for usage limits
- Review Railway deployment logs for errors

### Build Failures

- Check Railway build logs
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json` (not just devDependencies)

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Setup](https://developers.facebook.com/docs/facebook-login/web)

---

## 🚀 Next Steps

After deployment:

1. Set up monitoring (Railway provides basic monitoring)
2. Configure backups for PostgreSQL (Railway offers automated backups)
3. Set up error tracking (e.g., Sentry free tier)
4. Configure CDN for static assets (Cloudflare free tier)
5. Set up CI/CD for automated deployments

---

## 💡 Alternative Providers (If Railway Doesn't Work)

### Render.com
- Free tier available (limited)
- PostgreSQL addon: $7/month
- Custom domains included
- **Total: $7/month**

### Fly.io
- Free tier with limitations
- PostgreSQL: $1.94/month
- More complex setup
- **Total: ~$2-5/month**

### Vercel + Supabase
- Vercel: Free for frontend
- Supabase: Free tier PostgreSQL
- Need separate backend hosting
- **Total: $0-5/month**

---

**Need Help?** Check the [Railway Discord](https://discord.gg/railway) or [GitHub Issues](https://github.com/railwayapp/railway/issues).

---

## 🔐 Guide: Pushing Code to GitHub Using a Classic Token

This guide will walk you through creating a GitHub Personal Access Token (classic) and using it to push code to your repository **WITHOUT storing credentials on your computer**.

### ⭐ Key Feature: No Credentials Stored

This guide focuses on methods that **do NOT store your Git credentials** on your personal computer. You'll use your token each time you push, keeping your credentials secure.

### Prerequisites

- Git installed on your computer
- A GitHub account
- A GitHub Personal Access Token (classic) with `repo` scope
- A local repository initialized

---

### Step 1: Create a GitHub Classic Token

1. **Go to GitHub Settings**
   - Log in to [GitHub](https://github.com)
   - Click your profile picture (top right)
   - Click **Settings**

2. **Navigate to Developer Settings**
   - Scroll down in the left sidebar
   - Click **Developer settings** (at the bottom)

3. **Create Personal Access Token**
   - Click **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token** → **Generate new token (classic)**

4. **Configure Token Settings**
   - **Note**: Give it a descriptive name (e.g., "Property-Connect Development")
   - **Expiration**: Choose an expiration period (30 days, 60 days, 90 days, or no expiration)
   - **Select scopes**: Check the following permissions:
     - ✅ `repo` (Full control of private repositories) - **Required for pushing code**
     - ✅ `workflow` (if you use GitHub Actions)
     - ✅ `write:packages` (if you publish packages)

5. **Generate Token**
   - Scroll down and click **Generate token**
   - **⚠️ IMPORTANT**: Copy the token immediately! You won't be able to see it again.
   - Store it securely (password manager recommended)

---

### Step 2: Push Code WITHOUT Storing Credentials (Recommended)

If you don't want to store Git credentials on your computer, use one of these methods:

#### Option A: Push Using Token in URL (One-Time Use) ⭐ Recommended

This method uses the token directly in the push command without storing it:

1. **Check your remote URL:**
   ```bash
   git remote -v
   ```

2. **Push using token in URL (replace YOUR_TOKEN and yourusername):**
   ```bash
   git push https://YOUR_TOKEN@github.com/yourusername/Property-Connect.git main
   ```

   **Example:**
   ```bash
   git push https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/yourusername/Property-Connect.git main
   ```

3. **The token is NOT stored** - you'll need to use it each time you push

**Note:** Replace `main` with your branch name if different (e.g., `master`)

#### Option B: Temporarily Set Remote URL with Token

Set the remote URL with token, push, then remove it:

1. **Set remote URL with token:**
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/yourusername/Property-Connect.git
   ```

2. **Push your code:**
   ```bash
   git push origin main
   ```

3. **Remove token from remote URL (restore to normal):**
   ```bash
   git remote set-url origin https://github.com/yourusername/Property-Connect.git
   ```

**⚠️ Security Note:** The token will be stored in `.git/config` temporarily. Make sure to remove it after pushing (step 3).

#### Option C: Use Environment Variable (Most Secure)

Push using an environment variable without storing credentials:

**Windows (PowerShell):**
```powershell
$env:GIT_ASKPASS = "echo"
$env:GIT_USERNAME = "yourusername"
$env:GIT_PASSWORD = "YOUR_TOKEN"
git push origin main
```

**Windows (Command Prompt):**
```cmd
set GIT_ASKPASS=echo
set GIT_USERNAME=yourusername
set GIT_PASSWORD=YOUR_TOKEN
git push origin main
```

**macOS/Linux:**
```bash
GIT_ASKPASS=echo GIT_USERNAME=yourusername GIT_PASSWORD=YOUR_TOKEN git push origin main
```

**Note:** Environment variables are only available in the current terminal session and won't persist.

---

### Alternative: Configure Git Credential Helper (Stores Credentials)

⚠️ **Only use this if you want Git to remember your credentials**

**For Windows (PowerShell):**
```powershell
git config --global credential.helper wincred
```

**For macOS:**
```bash
git config --global credential.helper osxkeychain
```

**For Linux:**
```bash
git config --global credential.helper store
```

**Then push normally** - Git will prompt once and remember the credentials.

---

### Step 3: Complete Workflow Example (No Credentials Stored)

Here's a complete example of pushing code without storing credentials:

1. **Stage your changes:**
   ```bash
   git add .
   ```

2. **Commit your changes:**
   ```bash
   git commit -m "Your commit message"
   ```

3. **Push using token directly (NO credentials stored):**
   ```bash
   git push https://YOUR_TOKEN@github.com/yourusername/Property-Connect.git main
   ```

   Replace:
   - `YOUR_TOKEN` with your actual GitHub token
   - `yourusername` with your GitHub username
   - `Property-Connect` with your repository name
   - `main` with your branch name (if different)

**Example:**
```bash
git push https://ghp_abc123xyz789@github.com/johndoe/Property-Connect.git main
```

**✅ Result:** Code is pushed, and NO credentials are stored on your computer!

---

### Step 5: Verify Push Was Successful

1. Go to your GitHub repository in a browser
2. Check that your latest commits appear
3. Verify all files are present

---

### 🔒 Security Best Practices

1. **Never commit tokens to Git**
   - Add `.env` and token files to `.gitignore`
   - If accidentally committed, revoke the token immediately

2. **Use token expiration**
   - Set tokens to expire after a reasonable period
   - Rotate tokens regularly

3. **Limit token scope**
   - Only grant permissions you actually need
   - Use `repo` scope only if you need to push to private repos

4. **Store tokens securely**
   - Use a password manager
   - Don't share tokens in chat or email

5. **Revoke compromised tokens**
   - If a token is exposed, revoke it immediately
   - Generate a new token

---

### 🐛 Troubleshooting

#### Error: "Authentication failed" or "Invalid credentials"

- Verify your token hasn't expired
- Check that you're using the token (not your GitHub password)
- Ensure the token has `repo` scope enabled
- Try regenerating the token

#### Error: "Permission denied"

- Verify you have write access to the repository
- Check that the token has the correct scopes
- Ensure you're pushing to the correct branch

#### Error: "Remote URL not found"

- Verify your repository exists on GitHub
- Check the repository URL is correct
- Ensure you have access to the repository

#### Clear Stored Credentials (If Accidentally Stored)

If you accidentally stored credentials and want to remove them:

**Windows:**
```powershell
# Clear stored credentials
git credential-manager-core erase
# Or manually:
# 1. Open Windows Credential Manager
# 2. Go to Windows Credentials
# 3. Find and delete GitHub entries
```

**macOS:**
```bash
# Clear Keychain entry
git credential-osxkeychain erase
# Or use Keychain Access app to delete GitHub entries
```

**Linux:**
```bash
# Edit ~/.git-credentials and remove GitHub entries
nano ~/.git-credentials
```

**Then use the token-in-URL method** (Step 2, Option A) to push without storing credentials.

---

### 📝 Quick Reference Commands

**Push WITHOUT storing credentials (Recommended):**
```bash
# Stage, commit, and push in one go (no credentials stored)
git add .
git commit -m "Your message"
git push https://YOUR_TOKEN@github.com/yourusername/Property-Connect.git main
```

**Check remote URL:**
```bash
git remote -v
```

**Update remote to HTTPS (if needed):**
```bash
git remote set-url origin https://github.com/yourusername/Property-Connect.git
```

**Temporary push with token (then remove):**
```bash
# Set remote with token
git remote set-url origin https://YOUR_TOKEN@github.com/yourusername/Property-Connect.git
# Push
git push origin main
# Remove token (restore normal URL)
git remote set-url origin https://github.com/yourusername/Property-Connect.git
```

**Using environment variable (Windows PowerShell):**
```powershell
$env:GIT_PASSWORD = "YOUR_TOKEN"
git push origin main
```

---

### 🔄 Updating an Expired Token

If your token expires:

1. Generate a new token (follow Step 1)
2. Update stored credentials:
   - **Windows**: Delete old credentials in Windows Credential Manager
   - **macOS**: Delete old credentials in Keychain Access
   - **Linux**: Edit `~/.git-credentials` file
3. Push again - Git will prompt for new credentials

---

**Need More Help?**
- [GitHub Docs: Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Credential Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)