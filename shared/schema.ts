import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Enums
export const propertyTypeEnum = pgEnum("property_type", ["sale", "rent"]);
export const propertyCategoryEnum = pgEnum("property_category", ["house", "apartment", "land", "commercial"]);
export const currencyEnum = pgEnum("currency", ["MRU", "USD", "EUR"]);
export const languageEnum = pgEnum("language", ["en", "ar", "fr"]);

// User profiles (extends auth users)
export const userProfiles = pgTable("user_profiles", {
  userId: varchar("user_id").primaryKey(),
  displayName: varchar("display_name"),
  phone: varchar("phone"),
  whatsapp: varchar("whatsapp"),
  preferredLanguage: languageEnum("preferred_language").default("en"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

// App settings (singleton table for logo and support contacts)
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default("default"),
  logoUrl: varchar("logo_url"),
  supportPhone: varchar("support_phone"),
  supportWhatsapp: varchar("support_whatsapp"),
  supportEmail: varchar("support_email"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  currency: currencyEnum("currency").default("MRU").notNull(),
  location: varchar("location", { length: 500 }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: propertyTypeEnum("type").notNull(),
  category: propertyCategoryEnum("category").notNull(),
  images: text("images").array().notNull(),
  videoUrl: varchar("video_url"),
  tiktokUrl: varchar("tiktok_url"),
  facebookUrl: varchar("facebook_url"),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  contactWhatsapp: varchar("contact_whatsapp", { length: 50 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  size: integer("size"),
  isSold: boolean("is_sold").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  propertyId: varchar("property_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// View tracking
export const propertyViews = pgTable("property_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull(),
  viewerIp: varchar("viewer_ip"),
  userId: varchar("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  favorites: many(favorites),
  views: many(propertyViews),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

export const propertyViewsRelations = relations(propertyViews, ({ one }) => ({
  property: one(properties, {
    fields: [propertyViews.propertyId],
    references: [properties.id],
  }),
}));

// Insert schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string()).min(1, "At least one image is required").max(10),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  isAdmin: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type PropertyView = typeof propertyViews.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;

// Query filters type
export interface PropertyFilters {
  search?: string;
  type?: "sale" | "rent";
  category?: "house" | "apartment" | "land" | "commercial";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSize?: number;
  maxSize?: number;
  sortBy?: "date" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}
