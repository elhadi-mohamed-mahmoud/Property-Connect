# OAuth Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for Property-Connect.

## Quick Start

1. **For Local Development:** OAuth is optional. The app will use a mock user if no OAuth providers are configured.

2. **For Production:** Set up at least one OAuth provider (Google or Facebook).

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Property-Connect")
4. Click "Create"

### Step 2: Enable Google+ API

1. In the project dashboard, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`
   - Add test users (optional)
   - Click "Save and Continue" through the steps
4. Back in Credentials:
   - Application type: "Web application"
   - Name: "Property-Connect Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://your-domain.com/api/auth/google/callback` (for production)
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

### Step 4: Add to .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
BASE_URL=http://localhost:5000
```

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in:
   - App Display Name: "Property-Connect"
   - App Contact Email: Your email
5. Click "Create App"

### Step 2: Add Facebook Login

1. In the app dashboard, find "Add a Product"
2. Click "Set Up" on "Facebook Login"
3. Choose "Web" as the platform
4. Enter your site URL: `http://localhost:5000` (for development)
5. Click "Save"

### Step 3: Configure Settings

1. Go to "Settings" → "Basic"
2. Note your **App ID** and **App Secret**
3. Add App Domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
4. Add Website:
   - Site URL: `http://localhost:5000` (for development)
   - Site URL: `https://your-domain.com` (for production)
5. Click "Save Changes"

### Step 4: Configure Valid OAuth Redirect URIs

1. Go to "Facebook Login" → "Settings"
2. Under "Valid OAuth Redirect URIs", add:
   - `http://localhost:5000/api/auth/facebook/callback` (for development)
   - `https://your-domain.com/api/auth/facebook/callback` (for production)
3. Click "Save Changes"

### Step 5: Add to .env

```env
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here
BASE_URL=http://localhost:5000
```

## Complete .env Example

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_connect
SESSION_SECRET=your-session-secret-here
PORT=5000

# Base URL (important for OAuth callbacks)
BASE_URL=http://localhost:5000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (optional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Testing OAuth

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:5000/api/login` or `http://localhost:5000/api/auth/google` (or `/api/auth/facebook`)

3. You should be redirected to the OAuth provider's login page

4. After logging in, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in your `.env` (`BASE_URL`) matches exactly what you configured in the OAuth provider
- For Google: Check "Authorized redirect URIs" in Google Cloud Console
- For Facebook: Check "Valid OAuth Redirect URIs" in Facebook App Settings

### OAuth Not Working in Production

- Make sure `BASE_URL` is set to your production domain (e.g., `https://your-domain.com`)
- Ensure your production domain is added to authorized domains in both Google and Facebook
- Check that your production server is accessible via HTTPS (required for OAuth)

### Both Providers Not Working

- If neither Google nor Facebook OAuth is configured, the app will use a mock user for local development
- This is fine for testing, but you should set up at least one provider for production

## Security Notes

- Never commit your `.env` file to version control
- Keep your OAuth client secrets secure
- Use environment variables in production
- Rotate secrets if they're ever exposed
