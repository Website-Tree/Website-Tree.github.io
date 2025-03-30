import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMovieSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Promisify scrypt for password operations
const scryptAsync = promisify(scrypt);

// Declare global variable type
declare global {
  var accountsLocked: boolean;
}

// Global auth settings
global.accountsLocked = false;

// Helper function for password comparison
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to hash a password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Get default profile picture based on user role
function getDefaultProfilePicture(role: string) {
  if (role === 'owner') {
    return '/images/owner/owner.png';
  } else if (role === 'member') {
    return '/images/member/member.png';
  } else {
    return '/images/visitor/visitor.png';
  }
}

// Configure multer for file uploads
const createUploadsDirectory = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create subdirectories
  const videosDir = path.join(uploadsDir, "videos");
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  
  const thumbnailsDir = path.join(uploadsDir, "thumbnails");
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }
  
  const profilePicsDir = path.join(uploadsDir, "profile-pictures");
  if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir, { recursive: true });
  }
  
  return { uploadsDir, videosDir, thumbnailsDir, profilePicsDir };
};

const { videosDir, thumbnailsDir, profilePicsDir } = createUploadsDirectory();

// Create storage for videos and thumbnails
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create the profile pictures directory if it doesn't exist yet
    const profilePicsDir = path.join(process.cwd(), "uploads", "profile-pictures");
    if (!fs.existsSync(profilePicsDir)) {
      fs.mkdirSync(profilePicsDir, { recursive: true });
    }
    
    if (file.fieldname === "video") {
      cb(null, videosDir);
    } else if (file.fieldname === "thumbnail") {
      cb(null, thumbnailsDir);
    } else if (file.fieldname === "profilePicture") {
      cb(null, profilePicsDir);
    } else {
      cb(new Error("Invalid fieldname"), "");
    }
  },
  filename: (req, file, cb) => {
    const randomName = randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${randomName}${extension}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video") {
      const validTypes = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
      const extname = path.extname(file.originalname).toLowerCase();
      
      if (validTypes.includes(extname)) {
        return cb(null, true);
      }
      
      return cb(new Error("Only video files are allowed"));
    } else if (file.fieldname === "thumbnail") {
      const validTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const extname = path.extname(file.originalname).toLowerCase();
      
      if (validTypes.includes(extname)) {
        return cb(null, true);
      }
      
      return cb(new Error("Only image files are allowed"));
    } else if (file.fieldname === "profilePicture") {
      const validTypes = [".png", ".jpg", ".jpeg", ".ico"];
      const extname = path.extname(file.originalname).toLowerCase();
      
      if (validTypes.includes(extname)) {
        return cb(null, true);
      }
      
      return cb(new Error("Only .png, .jpeg, .jpg, and .ico files are allowed for profile pictures"));
    }
    
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), "uploads")));
  
  // Serve default profile images
  app.use('/images', express.static(path.join(process.cwd(), "images")));
  
  // API endpoint to get default profile picture by role
  app.get("/api/default-profile-picture/:role", (req, res) => {
    const role = req.params.role;
    const profilePicture = getDefaultProfilePicture(role);
    res.json({ profilePicture });
  });
  
  // API endpoint to get user profile details (for testing)
  app.get("/api/user-profile/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });
  
  // Movie routes
  app.get("/api/movies", async (req, res, next) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/movies/recent", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const movies = await storage.getRecentMovies(limit);
      res.json(movies);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/movies/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovie(id);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      next(error);
    }
  });
  
  // Upload a new movie
  app.post(
    "/api/movies",
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    async (req: Request, res: Response, next) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user as Express.User;
        
        if (!user.canUploadMovies) {
          return res.status(403).json({ message: "You don't have permission to upload movies" });
        }
        
        const files = req.files as { 
          [fieldname: string]: Express.Multer.File[] 
        } | undefined;
        
        if (!files || !files.video || !files.video[0]) {
          return res.status(400).json({ message: "Video file is required" });
        }
        
        const videoFile = files.video[0];
        const thumbnailFile = files.thumbnail?.[0];
        
        try {
          const movieData = {
            title: req.body.title,
            description: req.body.description || "",
            year: req.body.year ? parseInt(req.body.year) : undefined,
            duration: req.body.duration || "",
            quality: req.body.quality || "HD",
            videoUrl: `/uploads/videos/${videoFile.filename}`,
            thumbnailUrl: thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : undefined,
            uploaderId: user.id
          };
          
          const validatedData = insertMovieSchema.parse(movieData);
          const movie = await storage.createMovie(validatedData);
          
          res.status(201).json({
            ...movie,
            embedCode: `<iframe src="${req.protocol}://${req.get('host')}/embed/${movie.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`,
            directLink: `${req.protocol}://${req.get('host')}/watch/${movie.id}`
          });
        } catch (error) {
          // Remove uploaded files if validation fails
          if (videoFile) {
            fs.unlinkSync(videoFile.path);
          }
          if (thumbnailFile) {
            fs.unlinkSync(thumbnailFile.path);
          }
          throw error;
        }
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Delete a movie
  app.delete("/api/movies/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const movieId = parseInt(req.params.id);
      const movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      // Only allow owners or uploaders to delete movies
      if (user.role !== "owner" && movie.uploaderId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this movie" });
      }
      
      // Delete associated files
      if (movie.videoUrl) {
        const videoPath = path.join(process.cwd(), movie.videoUrl);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
      
      if (movie.thumbnailUrl) {
        const thumbnailPath = path.join(process.cwd(), movie.thumbnailUrl);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      
      await storage.deleteMovie(movieId);
      res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // Get movies in my list
  app.get("/api/my-movies", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      
      // Get user's movie list (movies they've added to their list)
      const movies = await storage.getUserMovieList(user.id);
      res.json(movies);
    } catch (error) {
      next(error);
    }
  });
  
  // Get movies uploaded by me
  app.get("/api/my-uploads", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const movies = await storage.getMoviesByUploader(user.id);
      res.json(movies);
    } catch (error) {
      next(error);
    }
  });
  
  // Add a movie to my list
  app.post("/api/my-list/add/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      // Check if movie exists
      const movie = await storage.getMovie(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      await storage.addMovieToUserList(user.id, movieId);
      res.status(200).json({ message: "Movie added to your list" });
    } catch (error) {
      next(error);
    }
  });
  
  // Remove a movie from my list
  app.delete("/api/my-list/remove/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      await storage.removeMovieFromUserList(user.id, movieId);
      res.status(200).json({ message: "Movie removed from your list" });
    } catch (error) {
      next(error);
    }
  });
  
  // Stream video - special route for handling range requests
  app.get("/api/stream/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovie(id);
      
      if (!movie || !movie.videoUrl) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      const videoPath = path.join(process.cwd(), movie.videoUrl);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ message: "Video file not found" });
      }
      
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        
        res.writeHead(206, headers);
        file.pipe(res);
      } else {
        const headers = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        
        res.writeHead(200, headers);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      next(error);
    }
  });

  // Account management routes
  
  // Change password endpoint
  app.post("/api/user/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Check if current password is correct
      const passwordMatches = await comparePasswords(currentPassword, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password and update the user
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // The global account locking endpoint has been removed
  // Individual account locking is maintained through the user-specific lock/unlock endpoint
  
  // User lock/unlock endpoint (admin/owner only)
  app.patch("/api/users/:id/lock", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const adminUser = req.user as Express.User;
      
      // Only owner can lock/unlock user accounts
      if (adminUser.role !== "owner") {
        return res.status(403).json({ message: "Only the owner can lock/unlock user accounts" });
      }
      
      const userId = parseInt(req.params.id);
      
      // Prevent locking the owner account
      const userToLock = await storage.getUser(userId);
      if (!userToLock) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (userToLock.username === "Syfer-eng") {
        return res.status(403).json({ message: "Cannot lock the owner account" });
      }
      
      const { isLocked } = req.body;
      
      // Update the user's locked status
      await storage.updateUser(userId, { isLocked });
      
      res.json({ 
        message: isLocked ? "Account locked successfully" : "Account unlocked successfully"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin change user password endpoint (owner only)
  app.post("/api/users/:id/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const adminUser = req.user as Express.User;
      
      // Only owner can change other users' passwords
      if (adminUser.role !== "owner") {
        return res.status(403).json({ message: "Only the owner can change other users' passwords" });
      }
      
      const userId = parseInt(req.params.id);
      
      // Get the user to update
      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { newPassword } = req.body;
      
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ 
        message: "User password changed successfully",
        username: userToUpdate.username
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Profile update endpoint
  app.patch("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const { displayName, profileColor } = req.body;
      
      // Update the user's profile
      const updatedUser = await storage.updateUserProfile(user.id, {
        displayName,
        profileColor
      });
      
      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Profile picture upload endpoint - disabled for all users, forcing role-based defaults
  app.post("/api/user/profile-picture", (req, res) => {
    // Return a 403 Forbidden response
    return res.status(403).json({ 
      message: "Custom profile pictures are disabled. All users must use the default role-based profile pictures."
    });
  });
  
  // Auth status check
  app.get("/api/auth-status", (req, res) => {
    res.json({ 
      authenticated: req.isAuthenticated(),
      accountsLocked: global.accountsLocked
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

