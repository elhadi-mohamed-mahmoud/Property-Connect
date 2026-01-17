import {
  properties,
  favorites,
  userProfiles,
  propertyViews,
  appSettings,
  type Property,
  type InsertProperty,
  type Favorite,
  type InsertFavorite,
  type UserProfile,
  type InsertUserProfile,
  type PropertyFilters,
  type AppSettings,
  type InsertAppSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Properties
  getProperties(filters: PropertyFilters): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: string): Promise<Property | undefined>;
  getPropertiesByUserId(userId: string): Promise<Property[]>;
  createProperty(property: InsertProperty & { userId: string }): Promise<Property>;
  updateProperty(id: string, userId: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string, userId: string): Promise<boolean>;
  incrementPropertyViews(id: string): Promise<void>;
  
  // Favorites
  getFavoritesByUserId(userId: string): Promise<Property[]>;
  getFavoriteIdsByUserId(userId: string): Promise<string[]>;
  addFavorite(userId: string, propertyId: string): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
  
  // User Profiles
  getProfile(userId: string): Promise<UserProfile | undefined>;
  upsertProfile(profile: InsertUserProfile): Promise<UserProfile>;
  
  // View tracking
  recordPropertyView(propertyId: string, viewerIp: string | null, userId: string | null): Promise<void>;
  hasViewedRecently(propertyId: string, viewerIp: string | null, userId: string | null): Promise<boolean>;
  
  // App Settings
  getAppSettings(): Promise<AppSettings | undefined>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  adminDeleteProperty(id: string): Promise<boolean>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(filters: PropertyFilters): Promise<{ properties: Property[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          ilike(properties.title, `%${filters.search}%`),
          ilike(properties.description, `%${filters.search}%`),
          ilike(properties.location, `%${filters.search}%`)
        )
      );
    }

    if (filters.type) {
      conditions.push(eq(properties.type, filters.type));
    }

    if (filters.category) {
      conditions.push(eq(properties.category, filters.category));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(properties.price, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(properties.price, filters.maxPrice));
    }

    if (filters.bedrooms !== undefined) {
      conditions.push(gte(properties.bedrooms, filters.bedrooms));
    }

    if (filters.bathrooms !== undefined) {
      conditions.push(gte(properties.bathrooms, filters.bathrooms));
    }

    if (filters.minSize !== undefined) {
      conditions.push(gte(properties.size, filters.minSize));
    }

    if (filters.maxSize !== undefined) {
      conditions.push(lte(properties.size, filters.maxSize));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    switch (filters.sortBy) {
      case "price_asc":
        orderByClause = asc(properties.price);
        break;
      case "price_desc":
        orderByClause = desc(properties.price);
        break;
      case "date":
      default:
        orderByClause = desc(properties.createdAt);
        break;
    }

    const [propertiesResult, countResult] = await Promise.all([
      db
        .select()
        .from(properties)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(properties)
        .where(whereClause),
    ]);

    return {
      properties: propertiesResult,
      total: countResult[0]?.count || 0,
    };
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertiesByUserId(userId: string): Promise<Property[]> {
    return db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty & { userId: string }): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(
    id: string,
    userId: string,
    updates: Partial<InsertProperty>
  ): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .returning();
    return updated;
  }

  async deleteProperty(id: string, userId: string): Promise<boolean> {
    // First delete related favorites
    await db.delete(favorites).where(eq(favorites.propertyId, id));
    
    // Then delete property views
    await db.delete(propertyViews).where(eq(propertyViews.propertyId, id));
    
    // Finally delete the property
    const result = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async incrementPropertyViews(id: string): Promise<void> {
    await db
      .update(properties)
      .set({ views: sql`${properties.views} + 1` })
      .where(eq(properties.id, id));
  }

  async getFavoritesByUserId(userId: string): Promise<Property[]> {
    const userFavorites = await db
      .select({ propertyId: favorites.propertyId })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    if (userFavorites.length === 0) return [];

    const propertyIds = userFavorites.map((f) => f.propertyId);
    return db
      .select()
      .from(properties)
      .where(inArray(properties.id, propertyIds));
  }

  async getFavoriteIdsByUserId(userId: string): Promise<string[]> {
    const userFavorites = await db
      .select({ propertyId: favorites.propertyId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return userFavorites.map((f) => f.propertyId);
  }

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, propertyId })
      .onConflictDoNothing()
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
      .returning();
    return result.length > 0;
  }

  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertProfile(profile: InsertUserProfile): Promise<UserProfile> {
    // Check if any admin exists
    const existingAdmins = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.isAdmin, true))
      .limit(1);
    
    // Check if this user already exists
    const existingUser = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, profile.userId))
      .limit(1);
    
    // If no admins exist and this is a new user, make them admin
    const makeAdmin = existingAdmins.length === 0 && existingUser.length === 0;
    
    const [upserted] = await db
      .insert(userProfiles)
      .values({ 
        userId: profile.userId,
        displayName: profile.displayName,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        preferredLanguage: profile.preferredLanguage,
        isAdmin: makeAdmin ? true : undefined,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: profile,
      })
      .returning();
    return upserted;
  }

  async recordPropertyView(
    propertyId: string,
    viewerIp: string | null,
    userId: string | null
  ): Promise<void> {
    await db.insert(propertyViews).values({ propertyId, viewerIp, userId });
  }

  async hasViewedRecently(
    propertyId: string,
    viewerIp: string | null,
    userId: string | null
  ): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const conditions = [
      eq(propertyViews.propertyId, propertyId),
      gte(propertyViews.viewedAt, oneHourAgo),
    ];

    if (userId) {
      conditions.push(eq(propertyViews.userId, userId));
    } else if (viewerIp) {
      conditions.push(eq(propertyViews.viewerIp, viewerIp));
    } else {
      return false;
    }

    const result = await db
      .select()
      .from(propertyViews)
      .where(and(...conditions))
      .limit(1);
    
    return result.length > 0;
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.id, "default"));
    
    // Seed default settings if none exist
    if (!settings) {
      const [seeded] = await db
        .insert(appSettings)
        .values({
          id: "default",
          supportPhone: "+1 (555) 123-4567",
          supportWhatsapp: "+15551234567",
          supportEmail: "support@propfind.com",
          updatedAt: new Date(),
        })
        .returning();
      return seeded;
    }
    
    return settings;
  }

  async updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings> {
    const [updated] = await db
      .insert(appSettings)
      .values({ id: "default", ...settings, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSettings.id,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return updated;
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.isAdmin ?? false;
  }

  async adminDeleteProperty(id: string): Promise<boolean> {
    // First delete related favorites
    await db.delete(favorites).where(eq(favorites.propertyId, id));
    
    // Then delete property views
    await db.delete(propertyViews).where(eq(propertyViews.propertyId, id));
    
    // Finally delete the property (no user check for admin)
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    await db
      .update(userProfiles)
      .set({ isAdmin })
      .where(eq(userProfiles.userId, userId));
  }
}

export const storage = new DatabaseStorage();
