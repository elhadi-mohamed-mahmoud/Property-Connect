import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./auth";
import { insertPropertySchema, insertAppSettingsSchema } from "@shared/schema";
import { z } from "zod";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "./cloudinary";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage when Cloudinary is configured (to upload to Cloudinary)
// Otherwise use disk storage for local development
const getMulterStorage = () => {
  if (isCloudinaryConfigured()) {
    // Use memory storage so we can upload to Cloudinary
    return multer.memoryStorage();
  }
  
  // Fallback to local disk storage
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
};

const upload = multer({
  storage: getMulterStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Not found");
    }
  });

  // Image upload endpoint
  app.post("/api/upload", isAuthenticated, upload.array("images", 10), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (isCloudinaryConfigured() && files.length > 0) {
        // Upload files to Cloudinary
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        res.json({ urls });
      } else {
        // Local storage - return relative paths
        const urls = files.map((file) => `/uploads/${file.filename}`);
        res.json({ urls });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Properties endpoints
  app.get("/api/properties", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        type: req.query.type as "sale" | "rent" | undefined,
        category: req.query.category as "house" | "apartment" | "land" | "commercial" | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
        minSize: req.query.minSize ? Number(req.query.minSize) : undefined,
        maxSize: req.query.maxSize ? Number(req.query.maxSize) : undefined,
        sortBy: req.query.sortBy as "date" | "price_asc" | "price_desc" | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      };

      const { properties, total } = await storage.getProperties(filters);
      const totalPages = Math.ceil(total / (filters.limit || 12));

      res.json({
        properties,
        total,
        page: filters.page,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req: any, res) => {
    try {
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Track views
      const viewerIp = req.ip || req.connection?.remoteAddress;
      const userId = req.user?.claims?.sub;

      // Don't count owner's views
      if (userId !== property.userId) {
        const hasViewed = await storage.hasViewedRecently(property.id, viewerIp, userId);
        if (!hasViewed) {
          await storage.recordPropertyView(property.id, viewerIp, userId);
          await storage.incrementPropertyViews(property.id);
        }
      }

      // Refetch to get updated view count
      const updatedProperty = await storage.getPropertyById(req.params.id);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const validatedData = insertPropertySchema.parse(req.body);
      
      const property = await storage.createProperty({
        ...validatedData,
        userId,
      });

      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.patch("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const updates = req.body;

      const property = await storage.updateProperty(req.params.id, userId, updates);
      if (!property) {
        return res.status(404).json({ message: "Property not found or unauthorized" });
      }

      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Check if user is admin - admins can delete any property
      const isAdmin = await storage.isUserAdmin(userId);
      
      let deleted: boolean;
      if (isAdmin) {
        deleted = await storage.adminDeleteProperty(req.params.id);
      } else {
        deleted = await storage.deleteProperty(req.params.id, userId);
      }
      
      if (!deleted) {
        return res.status(404).json({ message: "Property not found or unauthorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  app.get("/api/my-properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const properties = await storage.getPropertiesByUserId(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get properties by user ID (public endpoint)
  app.get("/api/users/:userId/properties", async (req, res) => {
    try {
      const { userId } = req.params;
      const properties = await storage.getPropertiesByUserId(userId);
      // Filter out sold properties for public view
      const activeProperties = properties.filter(p => !p.isSold);
      res.json(activeProperties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Favorites endpoints
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const properties = await storage.getFavoritesByUserId(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get("/api/favorites/ids", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const ids = await storage.getFavoriteIdsByUserId(userId);
      res.json(ids);
    } catch (error) {
      console.error("Error fetching favorite ids:", error);
      res.status(500).json({ message: "Failed to fetch favorite ids" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const favorite = await storage.addFavorite(userId, propertyId);
      res.status(201).json(favorite || { userId, propertyId, success: true });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:propertyId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { propertyId } = req.params;

      await storage.removeFavorite(userId, propertyId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Profile endpoints
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      let profile = await storage.getProfile(userId);
      
      if (!profile) {
        profile = await storage.upsertProfile({
          userId,
          preferredLanguage: "en",
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { displayName, phone, whatsapp, preferredLanguage, firstName, lastName } = req.body;

      // Update user account (firstName/lastName) if provided
      if (firstName !== undefined || lastName !== undefined || displayName) {
        const currentUser = await authStorage.getUser(userId);
        
        // If displayName is provided, parse it into firstName/lastName
        let firstNameToUpdate = firstName;
        let lastNameToUpdate = lastName;
        
        if (displayName && !firstName && !lastName) {
          // Parse displayName: "John Doe" -> firstName: "John", lastName: "Doe"
          const nameParts = displayName.trim().split(/\s+/);
          if (nameParts.length > 0) {
            firstNameToUpdate = nameParts[0];
            lastNameToUpdate = nameParts.slice(1).join(" ") || currentUser?.lastName || "";
          }
        }
        
        await authStorage.upsertUser({
          id: userId,
          email: currentUser?.email || "",
          firstName: firstNameToUpdate !== undefined ? firstNameToUpdate : currentUser?.firstName,
          lastName: lastNameToUpdate !== undefined ? lastNameToUpdate : currentUser?.lastName,
          profileImageUrl: currentUser?.profileImageUrl,
        });
      }

      const profile = await storage.upsertProfile({
        userId,
        displayName,
        phone,
        whatsapp,
        preferredLanguage,
      });

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // App Settings endpoints (public read, admin-only write)
  app.get("/api/app-settings", async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ message: "Failed to fetch app settings" });
    }
  });

  app.patch("/api/app-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate input
      const validationSchema = z.object({
        logoUrl: z.string().optional().nullable(),
        supportPhone: z.string().optional().nullable(),
        supportWhatsapp: z.string().optional().nullable(),
        supportEmail: z.string().email().optional().nullable().or(z.literal("")),
      });

      const validated = validationSchema.parse(req.body);
      
      // Only update non-undefined fields
      const updates: Record<string, string | null | undefined> = {};
      if (validated.logoUrl !== undefined) updates.logoUrl = validated.logoUrl;
      if (validated.supportPhone !== undefined) updates.supportPhone = validated.supportPhone;
      if (validated.supportWhatsapp !== undefined) updates.supportWhatsapp = validated.supportWhatsapp;
      if (validated.supportEmail !== undefined) updates.supportEmail = validated.supportEmail;

      const settings = await storage.updateAppSettings(updates);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating app settings:", error);
      res.status(500).json({ message: "Failed to update app settings" });
    }
  });

  // Admin check endpoint
  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const isAdmin = await storage.isUserAdmin(userId);
      res.json({ isAdmin });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  return httpServer;
}
