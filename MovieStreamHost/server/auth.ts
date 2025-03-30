import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserRole } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "movie-streaming-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // Authentication logic
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if the account is locked
        if (user.isLocked && user.role !== "owner") {
          return done(null, false, { message: "Your account has been locked. Please contact administrator." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize the admin account
  const initializeAdmin = async () => {
    try {
      const adminExists = await storage.getUserByUsername("Syfer-eng");
      
      if (!adminExists) {
        const adminUser = {
          username: "Syfer-eng",
          password: await hashPassword("Td906045"),
          role: UserRole.OWNER,
          canCreateUsers: true,
          canDeleteUsers: true,
          canUploadMovies: true
        };
        
        await storage.createUser(adminUser);
        console.log("Admin account created successfully");
      }
    } catch (error) {
      console.error("Error initializing admin account:", error);
    }
  };

  // Initialize admin account
  initializeAdmin();

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if user is logged in and has permission to create users
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "You must be logged in to register new users" });
      }

      const currentUser = req.user as SelectUser;
      if (currentUser.username !== "Syfer-eng" && !currentUser.canCreateUsers) {
        return res.status(403).json({ message: "You don't have permission to create users" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Set permissions based on role
      let canCreateUsers = false;
      let canDeleteUsers = false;
      let canUploadMovies = false;

      if (req.body.role === UserRole.MEMBER) {
        canUploadMovies = true;
      } else if (req.body.role === UserRole.OWNER) {
        canCreateUsers = true;
        canDeleteUsers = true;
        canUploadMovies = true;
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        canCreateUsers,
        canDeleteUsers,
        canUploadMovies
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        canCreateUsers: user.canCreateUsers,
        canDeleteUsers: user.canDeleteUsers,
        canUploadMovies: user.canUploadMovies
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          canCreateUsers: user.canCreateUsers,
          canDeleteUsers: user.canDeleteUsers,
          canUploadMovies: user.canUploadMovies,
          isLocked: user.isLocked
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as SelectUser;
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      canCreateUsers: user.canCreateUsers,
      canDeleteUsers: user.canDeleteUsers,
      canUploadMovies: user.canUploadMovies,
      isLocked: user.isLocked
    });
  });

  // User management routes
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = req.user as SelectUser;
      if (currentUser.role !== UserRole.OWNER) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        canCreateUsers: user.canCreateUsers,
        canDeleteUsers: user.canDeleteUsers,
        canUploadMovies: user.canUploadMovies,
        isLocked: user.isLocked,
        createdAt: user.createdAt
      })));
    } catch (error) {
      next(error);
    }
  });
  
  // API endpoint to toggle account lock status
  app.patch("/api/users/:id/lock", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = req.user as SelectUser;
      if (currentUser.role !== UserRole.OWNER) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userId = parseInt(req.params.id);
      const { isLocked } = req.body;
      
      if (typeof isLocked !== 'boolean') {
        return res.status(400).json({ message: "isLocked must be a boolean value" });
      }

      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow locking the owner account
      if (userToUpdate.username === "Syfer-eng") {
        return res.status(403).json({ message: "Cannot lock the owner account" });
      }

      await storage.updateUser(userId, { isLocked });

      res.status(200).json({ 
        message: isLocked ? "Account locked successfully" : "Account unlocked successfully" 
      });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = req.user as SelectUser;
      if (currentUser.role !== UserRole.OWNER && !currentUser.canDeleteUsers) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userId = parseInt(req.params.id);
      
      // Prevent deleting the owner account
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (userToDelete.username === "Syfer-eng") {
        return res.status(403).json({ message: "Cannot delete the owner account" });
      }

      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id/role", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = req.user as SelectUser;
      if (currentUser.role !== UserRole.OWNER) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow changing the owner's role
      if (userToUpdate.username === "Syfer-eng" && role !== UserRole.OWNER) {
        return res.status(403).json({ message: "Cannot change the owner's role" });
      }

      // Set permissions based on new role
      let canCreateUsers = false;
      let canDeleteUsers = false;
      let canUploadMovies = false;

      if (role === UserRole.MEMBER) {
        canUploadMovies = true;
      } else if (role === UserRole.OWNER) {
        canCreateUsers = true;
        canDeleteUsers = true;
        canUploadMovies = true;
      }

      await storage.updateUser(userId, {
        role,
        canCreateUsers,
        canDeleteUsers,
        canUploadMovies
      });

      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      next(error);
    }
  });
}
