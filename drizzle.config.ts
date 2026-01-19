import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Don't throw error during build - only validate when actually running drizzle-kit commands
// The error will be caught by drizzle-kit itself if DATABASE_URL is missing when needed
if (!process.env.DATABASE_URL) {
  // Only warn, don't throw - this allows the build to proceed
  // drizzle-kit will validate DATABASE_URL when it's actually used
  console.warn("DATABASE_URL not set - migrations will fail if you try to run them");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Use a placeholder if DATABASE_URL is not set (for build time)
    // drizzle-kit will validate this when actually connecting
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder",
  },
});
