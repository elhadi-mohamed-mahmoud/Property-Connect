import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Add connection error handling
  connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Test connection on startup
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

export const db = drizzle(pool, { schema });
