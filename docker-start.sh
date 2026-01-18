#!/bin/bash
# Start PostgreSQL container with database pre-created
docker-compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "PostgreSQL is running!"
echo "Database 'property_connect' has been created automatically."
echo ""
echo "You can now run:"
echo "  npm run db:push    # Create tables"
echo "  npm run dev        # Start the application"
