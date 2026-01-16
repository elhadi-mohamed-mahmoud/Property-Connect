# PropFind - Real Estate Listings Platform

## Overview

A comprehensive real estate marketplace where property owners can list properties for sale or rent, and buyers/renters can browse, search, and save favorite listings. The platform features an interactive map interface, multi-language support (English, Arabic with RTL, French), responsive design, and user authentication via Replit Auth.

## Recent Changes

**January 16, 2026:**
- Completed full platform implementation with properties CRUD, favorites, user profiles
- Implemented i18n system with English, Arabic (RTL), and French support
- Added interactive map views with Leaflet
- Created landing page for unauthenticated users
- Implemented image upload functionality
- Added view tracking with 1-hour deduplication
- Fixed numeric field handling in forms using Zod preprocess
- Replaced emoji flags with text codes in language selector
- Added admin system with:
  - Admin role flag in user profiles (isAdmin)
  - App settings for logo and support contacts
  - Admin can upload/change app logo
  - Admin can manage support phone, WhatsApp, and email
  - Admin can delete any property for content moderation
  - Support page with clickable contact links

## User Preferences

- Preferred communication style: Simple, everyday language
- Typography: Inter font family
- Design: Modern, clean real estate marketplace aesthetics

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next with support for English, Arabic (RTL), and French
- **Maps**: Leaflet with React-Leaflet (v4.2.1 for React 18 compatibility)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **File Uploads**: Multer for image handling (max 10 images, 10MB each)

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Validation**: Zod with drizzle-zod integration
- **Schema Location**: `shared/schema.ts` for shared types between frontend and backend

### Key Design Patterns
- **Monorepo Structure**: Client code in `client/`, server in `server/`, shared types in `shared/`
- **API Design**: RESTful endpoints under `/api/` prefix
- **Authentication Flow**: Replit OIDC with automatic user upsert on login
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` for database operations
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header.tsx           # Navigation with language switcher
│   │   ├── PropertyCard.tsx     # Individual property card
│   │   ├── PropertyGrid.tsx     # Grid layout for properties
│   │   ├── FilterPanel.tsx      # Search and filter controls
│   │   ├── PropertyMap.tsx      # Leaflet map integration
│   │   ├── ImageGallery.tsx     # Property image carousel
│   │   └── ImageUpload.tsx      # Multi-image upload component
│   ├── pages/           # Route components
│   │   ├── LandingPage.tsx      # Unauthenticated landing
│   │   ├── HomePage.tsx         # Authenticated home with listings
│   │   ├── PropertyDetail.tsx   # Single property view
│   │   ├── CreateListing.tsx    # Create/edit property form
│   │   ├── FavoritesPage.tsx    # User's saved properties
│   │   ├── SupportPage.tsx      # Support contact information
│   │   ├── AdminSettingsPage.tsx # Admin settings (logo, contacts)
│   │   └── ProfilePage.tsx      # User profile settings
│   ├── contexts/        # React contexts
│   │   └── LanguageContext.tsx  # Language/RTL state management
│   └── lib/             # Utilities and configurations
│       ├── i18n.ts              # i18next configuration
│       └── queryClient.ts       # TanStack Query setup
server/
├── routes.ts            # API endpoints
├── storage.ts           # Database operations (IStorage interface)
├── db.ts                # Database connection
└── replit_integrations/ # Auth and integrations
shared/
├── schema.ts            # Drizzle schema + Zod validation
└── models/
    └── auth.ts          # Auth-related models
```

## API Endpoints

### Properties
- `GET /api/properties` - List properties with filters and pagination
- `GET /api/properties/:id` - Get single property (with view tracking)
- `POST /api/properties` - Create property (authenticated)
- `PATCH /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner or admin)
- `GET /api/my-properties` - Get current user's properties

### Favorites
- `GET /api/favorites` - Get user's favorite properties
- `GET /api/favorites/ids` - Get list of favorite property IDs
- `POST /api/favorites` - Add to favorites (idempotent)
- `DELETE /api/favorites/:propertyId` - Remove from favorites

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Uploads
- `POST /api/upload` - Upload images (returns array of URLs)

### App Settings & Admin
- `GET /api/app-settings` - Get app settings (logo, support contacts) - public
- `PATCH /api/app-settings` - Update app settings (admin only)
- `GET /api/admin/check` - Check if current user is admin

## Database Schema

### Tables
- **properties**: Property listings with all details
- **favorites**: User-property favorites (unique constraint)
- **user_profiles**: Extended user information (includes isAdmin flag)
- **property_views**: View tracking with IP/user deduplication
- **app_settings**: Application settings (logo URL, support contacts)
- **sessions**: PostgreSQL session store

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OIDC provider at `https://replit.com/oidc`
- **Required Secrets**: `SESSION_SECRET`

### Third-Party Services
- **Leaflet Maps**: OpenStreetMap tiles for property location display
- **Google Fonts**: Inter font family for typography

## Development

### Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run build` - Build for production

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit environment identifier
