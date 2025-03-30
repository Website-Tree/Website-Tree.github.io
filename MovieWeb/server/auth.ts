import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, verifyCodeSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Fixed verification code specifically for owner account
const OWNER_VERIFICATION_CODE = "16120";

// Function to get verification code - always returns the fixed code for owner
function generateVerificationCode(): string {
  return OWNER_VERIFICATION_CODE;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "streamoves-secret-key";
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Store pending verifications
  const pendingVerifications = new Map<number, { code: string, expires: Date }>();
  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false);
      }
      
      // Special case for the owner account
      if (username === "Syfer-eng" && password === "Td906045") {
        // Mark user as needing verification
        user.needsVerification = true;
        return done(null, user);
      }
      
      // Normal password check for other users
      if (!(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
      isAdmin: false,
      isLocked: false
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    const user = req.user as SelectUser & { needsVerification?: boolean };
    
    if (user.isLocked) {
      req.logout((err) => {
        if (err) return res.status(500).send("Error during logout");
        res.status(403).json({ message: "Account is locked", isLocked: true });
      });
      return;
    }
    
    // Handle owner verification
    if (user.needsVerification) {
      // Create a fixed verification code for owner
      const verificationCode = "16120"; // Fixed code for owner account
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code
      pendingVerifications.set(user.id, {
        code: verificationCode,
        expires: expiryTime
      });
      
      // Return a response that indicates verification is needed
      return res.status(202).json({
        message: "Verification required",
        needsVerification: true,
        userId: user.id
      });
    }
    
    res.status(200).json(req.user);
  });
  
  // Endpoint to verify the code
  app.post("/api/verify-code", (req, res) => {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ message: "User ID and verification code are required" });
    }
    
    const verification = pendingVerifications.get(parseInt(userId));
    
    if (!verification) {
      return res.status(400).json({ message: "No verification pending for this user" });
    }
    
    if (new Date() > verification.expires) {
      pendingVerifications.delete(parseInt(userId));
      return res.status(400).json({ message: "Verification code has expired" });
    }
    
    if (verification.code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    
    // Code is valid, clean up and allow login
    pendingVerifications.delete(parseInt(userId));
    
    // Mark user as verified
    storage.updateVerificationStatus(parseInt(userId), true)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login error after verification" });
          }
          res.status(200).json(user);
        });
      })
      .catch(err => {
        console.error("Error during verification:", err);
        res.status(500).json({ message: "Server error during verification" });
      });
  });
  
  // Endpoint to request a verification code (for settings page)
  app.post("/api/request-verification", async (req, res) => {
    const { userId, email } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ message: "User ID and email are required" });
    }
    
    try {
      // Get the user
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow for owner account
      if (user.username !== "Syfer-eng") {
        return res.status(403).json({ message: "Verification is only available for administrator accounts" });
      }
      
      // Generate a verification code
      const verificationCode = generateVerificationCode();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code
      pendingVerifications.set(user.id, {
        code: verificationCode,
        expires: expiryTime
      });
      
      // Update user email if needed
      if (user.email !== email) {
        await storage.updateUserEmail(user.id, email);
      }
      
      // Log the verification code (fixed code 16120)
      console.log(`
      ========================================
      OWNER VERIFICATION CODE: ${verificationCode}
      ========================================
      `);
      
      // Store the code in the user record
      await storage.updateVerificationCode(user.id, verificationCode);
      
      return res.status(200).json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error requesting verification:", error);
      res.status(500).json({ message: "Server error during verification request" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
