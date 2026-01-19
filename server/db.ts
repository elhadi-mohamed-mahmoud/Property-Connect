import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Don't throw immediately - let the app start and fail gracefully on first database query
if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL is not set. Database operations will fail.");
  console.error("Make sure DATABASE_URL is set in Railway environment variables.");
}

// Create pool with placeholder URL if DATABASE_URL is not set
// This allows the app to start, but database queries will fail
export const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({ 
      connectionString: "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      connectionTimeoutMillis: 10000,
    });

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Test connection on startup (only if DATABASE_URL is set)
if (process.env.DATABASE_URL) {
  pool.connect()
    .then((client) => {
      console.log("Database connection established successfully");
      client.release();
    })
    .catch((err) => {
      console.error("Failed to connect to database:", err.message);
      console.error("Make sure DATABASE_URL is correct and the database is accessible");
      // Don't throw here - let the app start and fail gracefully on first query
    });
} else {
  console.warn("DATABASE_URL not set - skipping database connection test");
}

export const db = drizzle(pool, { schema });
