# Database Setup Guide

## Option 1: Install PostgreSQL Locally

### Windows Installation

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (usually "Download the installer")
   - Run the installer

2. **During Installation:**
   - Remember the password you set for the `postgres` user
   - Default port is `5432` (keep this)
   - Installation location is usually `C:\Program Files\PostgreSQL\[version]`

3. **After Installation:**
   - PostgreSQL should start automatically as a Windows service
   - You can verify it's running in Services (services.msc) - look for "postgresql-x64-[version]"

4. **Create the Database:**
   
   **Using pgAdmin (GUI - Recommended):**
   - Open pgAdmin (installed with PostgreSQL)
   - Connect to the server (use the password you set during installation)
   - Right-click "Databases" → "Create" → "Database"
   - Name: `property_connect`
   - Click "Save"

   **Using Command Line:**
   - Open Command Prompt or PowerShell
   - Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\[version]\bin`)
   - Run:
     ```cmd
     psql -U postgres -c "CREATE DATABASE property_connect;"
     ```
   - Enter your password when prompted

   **Or add PostgreSQL to PATH:**
   - Add `C:\Program Files\PostgreSQL\[version]\bin` to your system PATH
   - Then you can use `psql` from anywhere

## Option 2: Use Docker (Easier Alternative)

If you have Docker installed, you can run PostgreSQL in a container:

```bash
# Run PostgreSQL container
docker run --name postgres-property-connect `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=property_connect `
  -p 5432:5432 `
  -d postgres:15

# The database will be created automatically!
```

Then update your `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_connect
```

## Option 3: Use a Cloud Database (Free Options)

### Supabase (Free Tier)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Copy the connection string from Settings → Database
5. Update your `.env` file with the connection string

### Neon (Free Tier)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update your `.env` file

## Verify Database Connection

After setting up the database, test the connection:

```bash
npm run db:push
```

This should create all the necessary tables. If you see an error, check:
- PostgreSQL is running
- Database `property_connect` exists
- Credentials in `.env` are correct
- Port 5432 is not blocked by firewall

## Current .env Configuration

Your current `.env` file expects:
- **Host:** localhost
- **Port:** 5432
- **Username:** postgres
- **Password:** postgres (change this to your actual password)
- **Database:** property_connect

Make sure these match your PostgreSQL setup!
