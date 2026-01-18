# Local Setup Guide

Follow these steps to run Property-Connect locally on your machine.

## Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

### Windows
1. Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
2. Run the installer and remember the password you set for the `postgres` user
3. PostgreSQL will run as a service automatically

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Open a PostgreSQL terminal (psql) or use a GUI tool like pgAdmin:

```sql
-- Connect to PostgreSQL (default user is usually 'postgres')
-- Then run:
CREATE DATABASE property_connect;
```

Or via command line:
```bash
# Windows (if PostgreSQL is in PATH)
psql -U postgres -c "CREATE DATABASE property_connect;"

# macOS/Linux
sudo -u postgres psql -c "CREATE DATABASE property_connect;"
```

## Step 3: Create .env File

Create a `.env` file in the project root with the following content:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/property_connect
SESSION_SECRET=your-random-secret-key-here
PORT=5000
BASE_URL=http://localhost:5000

# Optional: OAuth Configuration (at least one recommended for production)
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

**Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password
- Replace `your-random-secret-key-here` with a random string (you can generate one using the command below)
- OAuth credentials are optional for local development (mock user will be used)
- For production, set up at least one OAuth provider (Google or Facebook)

### Generate Session Secret

Run this command to generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `SESSION_SECRET` value.

## Step 4: Initialize Database Schema

Run the database migration to create all tables:

```bash
npm run db:push
```

This will create all necessary tables in your database.

## Step 5: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port you specified).

## Troubleshooting

### "DATABASE_URL must be set" Error
- Make sure you created the `.env` file in the project root
- Check that the file is named exactly `.env` (not `.env.txt` or similar)
- Verify the `DATABASE_URL` format is correct

### "Connection refused" or Database Connection Error
- Ensure PostgreSQL is running:
  - Windows: Check Services (services.msc) for "postgresql"
  - macOS: `brew services list` should show postgresql as started
  - Linux: `sudo systemctl status postgresql`
- Verify your database credentials in `.env`
- Check that the database `property_connect` exists

### Port Already in Use
- Change the `PORT` value in `.env` to a different port (e.g., 5001, 3000)
- Or stop the process using port 5000

### Authentication Issues

**Without OAuth (Local Development):**
- The app will automatically use a mock user for local development
- No OAuth setup required for testing

**With OAuth (Production):**
- Set up Google OAuth: https://console.cloud.google.com/
- Set up Facebook OAuth: https://developers.facebook.com/
- Make sure callback URLs match your `BASE_URL` environment variable
- For local development, use: `http://localhost:5000/api/auth/google/callback`

## Next Steps

Once the server is running:
1. Open `http://localhost:5000` in your browser
2. You should see the landing page
3. Try creating an account or logging in (if auth is configured)

## Need Help?

- Check the main [README.md](./README.md) for more information
- Check [design_guidelines.md](./design_guidelines.md) for UI specifications
