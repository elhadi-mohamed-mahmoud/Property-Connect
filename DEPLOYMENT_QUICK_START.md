# Quick Deployment Checklist

Use this checklist to quickly deploy your Property-Connect app to production.

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] All dependencies installed (`npm install`)
- [ ] App runs locally without errors

---

## 🚀 Deployment Steps

### 1. Cloudinary Setup (5 minutes)

- [ ] Sign up at [cloudinary.com](https://cloudinary.com/users/register/free)
- [ ] Copy credentials from dashboard:
  - [ ] Cloud Name
  - [ ] API Key
  - [ ] API Secret

### 2. Railway Deployment (10 minutes)

- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Create new project from GitHub repo
- [ ] Add PostgreSQL database (Railway → + New → Database → PostgreSQL)
- [ ] Note your Railway app URL (e.g., `your-app.up.railway.app`)

### 3. Database Migration (5 minutes)

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Link project: `railway link`
- [ ] Run migration: `railway run npm run db:push`

### 4. Environment Variables (5 minutes)

Add these in Railway → Your Service → Variables:

**Required:**
- [ ] `SESSION_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `BASE_URL` (your Railway URL: `https://your-app.up.railway.app`)

**Cloudinary:**
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

**Google OAuth (Already configured):**
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

**Facebook OAuth (New):**
- [ ] `FACEBOOK_APP_ID`
- [ ] `FACEBOOK_APP_SECRET`

**Note:** `DATABASE_URL` and `PORT` are automatically set by Railway.

### 5. Update OAuth Callbacks (10 minutes)

**Google OAuth:**
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] APIs & Services → Credentials → Your OAuth Client
- [ ] Add Authorized JavaScript origins: `https://your-app.up.railway.app`
- [ ] Add Authorized redirect URIs: `https://your-app.up.railway.app/api/auth/google/callback`

**Facebook OAuth:**
- [ ] Go to [Facebook Developers](https://developers.facebook.com/)
- [ ] Create new app (Consumer type)
- [ ] Add Facebook Login product
- [ ] Settings → Basic:
  - [ ] Add App Domain: `your-app.up.railway.app`
  - [ ] Add Website URL: `https://your-app.up.railway.app`
- [ ] Facebook Login → Settings:
  - [ ] Add Valid OAuth Redirect URI: `https://your-app.up.railway.app/api/auth/facebook/callback`
- [ ] Copy App ID and App Secret to Railway environment variables

### 6. Deploy & Test (5 minutes)

- [ ] Railway will auto-deploy on git push, or click "Redeploy"
- [ ] Visit your Railway URL
- [ ] Test Google login
- [ ] Test Facebook login
- [ ] Test image upload
- [ ] Test creating a property

---

## 🎉 You're Live!

Your app should now be accessible at: `https://your-app.up.railway.app`

---

## 🔧 Optional: Custom Domain

1. Purchase domain (Namecheap, Cloudflare, etc.)
2. Railway → Settings → Networking → Custom Domain
3. Add domain and configure DNS (CNAME to Railway URL)
4. Update OAuth callbacks with new domain
5. Update `BASE_URL` environment variable

---

## 📚 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive step-by-step instructions.

---

## 🆘 Troubleshooting

**Database connection error?**
- Check `DATABASE_URL` is set (Railway sets this automatically)
- Verify PostgreSQL service is running in Railway

**OAuth not working?**
- Verify `BASE_URL` matches your actual domain exactly
- Check callback URLs match in OAuth provider settings
- Ensure domain uses HTTPS (Railway provides automatically)

**Images not uploading?**
- Verify Cloudinary credentials are correct
- Check Railway logs for errors
- Ensure Cloudinary account is active

**Build failing?**
- Check Railway build logs
- Verify `package.json` has all dependencies
- Ensure build command is: `npm run build`
