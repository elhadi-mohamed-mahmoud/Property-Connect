import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../db";
import { eq, or } from "drizzle-orm";

// Interface for auth storage operations
// These user operations are used by OAuth providers (Google, Facebook).
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdOrEmail(id: string, email?: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByIdOrEmail(id: string, email?: string): Promise<User | undefined> {
    if (email) {
      const [user] = await db
        .select()
        .from(users)
        .where(or(eq(users.id, id), eq(users.email, email)));
      return user;
    }
    return this.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
