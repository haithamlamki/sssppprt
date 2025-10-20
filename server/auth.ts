import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "abraj-sports-committee-secret-2025",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password login
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          
          if (!user) {
            return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
          }

          if (!user.isActive) {
            return done(null, false, { message: "الحساب غير مفعل. يرجى التواصل مع الإدارة" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to store in session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة" });
}

// Middleware to check if user is admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && (req.user.role === "admin" || req.user.role === "committee_member")) {
    return next();
  }
  res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذه الصفحة" });
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
