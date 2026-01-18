import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { authStorage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  await authStorage.upsertUser({
    id: profile.id,
    email: profile.email || "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Check for required environment variables
  const hasGoogleAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasFacebookAuth = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

  if (!hasGoogleAuth && !hasFacebookAuth) {
    console.warn("⚠️  No OAuth providers configured. Please set up Google or Facebook OAuth credentials.");
    console.warn("⚠️  Authentication will be bypassed for local development");
    
    // Set up basic passport serialization for local dev
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    // Mock login endpoint for local dev
    app.get("/api/login", async (req, res) => {
      try {
        const mockUserId = "local-dev-user";
        await authStorage.upsertUser({
          id: mockUserId,
          email: "dev@localhost",
          firstName: "Local",
          lastName: "Developer",
        });
        
        const mockUser = {
          id: mockUserId,
          email: "dev@localhost",
          claims: {
            sub: mockUserId,
            email: "dev@localhost",
            first_name: "Local",
            last_name: "Developer",
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        req.login(mockUser, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          res.redirect("/");
        });
      } catch (error) {
        console.error("Error in mock login:", error);
        res.status(500).json({ message: "Login failed" });
      }
    });

    app.get("/api/logout", (req, res) => {
      // Clear the session cookie
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        // Clear the cookie
        res.clearCookie("connect.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
        // Also clear passport session
        req.logout(() => {
          res.redirect("/");
        });
      });
    });

    return;
  }

  // Get base URL for callbacks - use BASE_URL env var or default to localhost in dev
  const baseUrl = process.env.BASE_URL || 
    (process.env.NODE_ENV === "development" 
      ? `http://localhost:${process.env.PORT || 5000}`
      : "https://your-domain.com");

  // Google OAuth Strategy
  if (hasGoogleAuth) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${baseUrl}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const name = profile.displayName?.split(" ") || [];
            const firstName = name[0] || "";
            const lastName = name.slice(1).join(" ") || "";
            const userId = `google_${profile.id}`;

            // Check if user exists (by ID or email)
            const existingUser = await authStorage.getUserByIdOrEmail(userId, email);
            const isNewUser = !existingUser;

            // Upsert user (creates if new, updates if exists)
            await upsertUser({
              id: userId,
              email,
              firstName,
              lastName,
              profileImageUrl: profile.photos?.[0]?.value,
            });

            const user = {
              id: userId,
              email,
              isNewUser, // Flag to indicate if this is a new registration
              claims: {
                sub: userId,
                email,
                first_name: firstName,
                last_name: lastName,
              },
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            };

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );

    // Google OAuth routes
    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account", // Force account selection
      })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/?error=auth_failed",
      }),
      (req: any, res) => {
        // Check if this is a new user registration
        const isNewUser = req.user?.isNewUser;
        if (isNewUser) {
          res.redirect("/?registered=true");
        } else {
          res.redirect("/?logged_in=true");
        }
      }
    );
  }

  // Facebook OAuth Strategy
  if (hasFacebookAuth) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID!,
          clientSecret: process.env.FACEBOOK_APP_SECRET!,
          callbackURL: `${baseUrl}/api/auth/facebook/callback`,
          profileFields: ["id", "displayName", "email", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const name = profile.displayName?.split(" ") || [];
            const firstName = name[0] || "";
            const lastName = name.slice(1).join(" ") || "";
            const userId = `facebook_${profile.id}`;

            // Check if user exists (by ID or email)
            const existingUser = await authStorage.getUserByIdOrEmail(userId, email);
            const isNewUser = !existingUser;

            // Upsert user (creates if new, updates if exists)
            await upsertUser({
              id: userId,
              email,
              firstName,
              lastName,
              profileImageUrl: profile.photos?.[0]?.value,
            });

            const user = {
              id: userId,
              email,
              isNewUser, // Flag to indicate if this is a new registration
              claims: {
                sub: userId,
                email,
                first_name: firstName,
                last_name: lastName,
              },
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            };

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );

    // Facebook OAuth routes
    app.get(
      "/api/auth/facebook",
      passport.authenticate("facebook", {
        scope: ["email"],
      })
    );

    app.get(
      "/api/auth/facebook/callback",
      passport.authenticate("facebook", {
        failureRedirect: "/?error=auth_failed",
      }),
      (req: any, res) => {
        // Check if this is a new user registration
        const isNewUser = req.user?.isNewUser;
        if (isNewUser) {
          res.redirect("/?registered=true");
        } else {
          res.redirect("/?logged_in=true");
        }
      }
    );
  }

  // Generic login route - serve login selection page
  // The frontend will handle showing the login options
  app.get("/api/login", (req, res) => {
    // If only one provider, redirect directly
    if (hasGoogleAuth && !hasFacebookAuth) {
      res.redirect("/api/auth/google");
    } else if (hasFacebookAuth && !hasGoogleAuth) {
      res.redirect("/api/auth/facebook");
    } else if (!hasGoogleAuth && !hasFacebookAuth) {
      res.status(400).json({ message: "No OAuth providers configured" });
    } else {
      // Both providers available - redirect to login page (frontend will show selection)
      // Pass a query param to indicate we want to show login page
      res.redirect("/login");
    }
  });

  app.get("/api/logout", (req, res) => {
    // Clear the session cookie
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      // Clear the cookie
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      // Also clear passport session
      req.logout(() => {
        res.redirect("/");
      });
    });
  });

  // Passport serialization
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In local development without OAuth, allow all requests
  const hasGoogleAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasFacebookAuth = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

  if (!hasGoogleAuth && !hasFacebookAuth) {
    // Auto-login with mock user if not authenticated
    if (!req.isAuthenticated()) {
      const mockUserId = "local-dev-user";
      try {
        await authStorage.upsertUser({
          id: mockUserId,
          email: "dev@localhost",
          firstName: "Local",
          lastName: "Developer",
        });
      } catch (error) {
        console.error("Error creating mock user:", error);
      }

      const mockUser = {
        id: mockUserId,
        email: "dev@localhost",
        claims: {
          sub: mockUserId,
          email: "dev@localhost",
          first_name: "Local",
          last_name: "Developer",
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
      req.login(mockUser, () => {
        return next();
      });
      return;
    }
    return next();
  }

  // OAuth flow - require authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};
