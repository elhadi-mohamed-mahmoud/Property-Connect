# Property-Connect (Dari.com)

A comprehensive real estate marketplace platform built with React, TypeScript, Express, and PostgreSQL. Features property listings, favorites, interactive maps, multi-language support (English, Arabic with RTL, French), and user authentication.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** (for database) or **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Database

**Option A: Using Docker (Recommended)**

The project includes a `docker-compose.yml` that automatically creates the database:

```bash
# Start PostgreSQL container (database is created automatically)
npm run docker:up

# Or use docker-compose directly
docker-compose up -d
```

The database `property_connect` will be created automatically when the container starts.

**Option B: Using Local PostgreSQL**

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE property_connect;
   ```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
# For Docker: postgresql://postgres:postgres@localhost:5432/property_connect
# For local PostgreSQL: postgresql://username:password@localhost:5432/property_connect
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_connect

# Session Secret (generate a random string)
# You can generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-secret-key-here-change-this-in-production

# Server Port (optional, defaults to 5000)
PORT=5000
```

**Note:** The default Docker setup uses `postgres/postgres` as username/password. Change these in `docker-compose.yml` if needed.

### Step 4: Push Database Schema

Run the database migrations to create all necessary tables:

```bash
npm run db:push
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or the port you specified in `.env`).

### Docker Commands

- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View PostgreSQL logs
- `npm run docker:restart` - Restart PostgreSQL container

## 📁 Project Structure

```
Property-Connect/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Route components
│   │   ├── contexts/   # React contexts
│   │   └── lib/        # Utilities and configurations
├── server/              # Express backend
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations
│   ├── db.ts           # Database connection
│   └── auth/  # Authentication integrations
├── shared/              # Shared types and schemas
│   ├── schema.ts       # Drizzle schema + Zod validation
│   └── models/         # Shared models
└── uploads/            # Uploaded property images
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - Type check TypeScript code
- `npm run db:push` - Push schema changes to database

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `PORT` | Server port (default: 5000) | No |
| `BASE_URL` | Base URL for OAuth callbacks (e.g., `http://localhost:5000` for dev) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | No* |
| `FACEBOOK_APP_ID` | Facebook App ID | No* |
| `FACEBOOK_APP_SECRET` | Facebook App Secret | No* |

\* At least one OAuth provider (Google or Facebook) is required for production. If none are configured, a mock user will be used for local development.

### Database Setup

The application uses **Drizzle ORM** with PostgreSQL. The schema is defined in `shared/schema.ts` and includes:

- `properties` - Property listings
- `favorites` - User favorites
- `user_profiles` - Extended user information
- `property_views` - View tracking
- `app_settings` - Application settings
- `sessions` - Session store

## 🌐 Features

- **Property Listings**: Create, view, edit, and delete property listings
- **Search & Filters**: Advanced filtering by price, location, type, category
- **Interactive Maps**: Leaflet-based map view for property locations
- **Favorites**: Save and manage favorite properties
- **Multi-language**: Support for English, Arabic (RTL), and French
- **Image Upload**: Multiple image uploads per property
- **User Profiles**: User profile management
- **Admin Panel**: Admin settings for logo and support contacts
- **View Tracking**: Track property views with deduplication

## 🔐 Authentication

The application supports **Google OAuth** and **Facebook OAuth** for authentication.

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback` (for development)
7. Copy the Client ID and Client Secret to your `.env` file

### Setting Up Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product
4. Go to Settings → Basic
5. Add authorized redirect URI: `http://localhost:5000/api/auth/facebook/callback` (for development)
6. Copy the App ID and App Secret to your `.env` file

### OAuth Routes

- `GET /api/login` - Redirects to OAuth provider (Google if both configured, otherwise first available)
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Facebook OAuth login
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current authenticated user

**Note:** For local development without OAuth credentials, the app will use a mock user automatically.

## 📝 API Endpoints

### Properties
- `GET /api/properties` - List properties with filters
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (authenticated)
- `PATCH /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner or admin)

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:propertyId` - Remove from favorites

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile


## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database exists and user has proper permissions

### Port Already in Use

- Change `PORT` in `.env` file
- Or stop the process using port 5000

### Windows Compatibility

The project uses `cross-env` for Windows compatibility. If you encounter issues, ensure it's installed:

```bash
npm install --save-dev cross-env
```

## 📚 Additional Resources

- [Design Guidelines](./design_guidelines.md) - UI/UX design specifications

## 🎨 Design

The platform features a Mauritanian-inspired color scheme (green and gold) with:
- Modern, clean real estate marketplace aesthetics
- Responsive design for mobile, tablet, and desktop
- RTL support for Arabic language
- Professional property photography layouts

## 📄 License

MIT
