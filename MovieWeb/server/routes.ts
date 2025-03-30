import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { UserRole, insertMovieSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  setupAuth(app);

  // Helper function to check user permissions
  const isOwner = (req: any) => {
    return req.isAuthenticated() && req.user?.role === UserRole.OWNER;
  };
  
  const canManageUsers = (req: any) => {
    return req.isAuthenticated() && (
      req.user?.role === UserRole.OWNER ||
      req.user?.isAdmin
    );
  };
  
  const canUploadContent = (req: any) => {
    return req.isAuthenticated() && (
      req.user?.role === UserRole.OWNER ||
      req.user?.role === UserRole.MEMBER
    );
  };

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!canManageUsers(req)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const users = await storage.getAllUsers();
    res.json(users);
  });
  
  app.patch("/api/admin/users/:id/lock", async (req, res) => {
    if (!canManageUsers(req)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const idSchema = z.number().int().positive();
    const bodySchema = z.object({ 
      isLocked: z.boolean(),
      lockReason: z.string().optional()
    });
    
    try {
      const id = idSchema.parse(parseInt(req.params.id));
      const { isLocked, lockReason } = bodySchema.parse(req.body);
      
      // Don't allow locking of owner account
      const targetUser = await storage.getUser(id);
      if (targetUser?.role === UserRole.OWNER) {
        return res.status(403).json({ message: "Cannot lock the owner account" });
      }
      
      const updatedUser = await storage.updateUserLockStatus(id, isLocked, lockReason);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  app.patch("/api/admin/users/:id/role", async (req, res) => {
    if (!isOwner(req)) {
      return res.status(403).json({ message: "Only the owner can change user roles" });
    }
    
    const idSchema = z.number().int().positive();
    const bodySchema = z.object({ 
      role: z.enum([UserRole.VISITOR, UserRole.MEMBER])
    });
    
    try {
      const id = idSchema.parse(parseInt(req.params.id));
      const { role } = bodySchema.parse(req.body);
      
      // Don't allow changing owner's role
      const targetUser = await storage.getUser(id);
      if (targetUser?.role === UserRole.OWNER) {
        return res.status(403).json({ message: "Cannot change the owner's role" });
      }
      
      const updatedUser = await storage.updateUserRole(id, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!isOwner(req)) {
      return res.status(403).json({ message: "Only the owner can delete users" });
    }
    
    const idSchema = z.number().int().positive();
    
    try {
      const id = idSchema.parse(parseInt(req.params.id));
      
      // Don't allow deleting owner
      const targetUser = await storage.getUser(id);
      if (targetUser?.role === UserRole.OWNER) {
        return res.status(403).json({ message: "Cannot delete the owner account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  // Movie routes
  app.get("/api/movies", async (req, res) => {
    const movies = await storage.getAllMovies();
    res.json(movies);
  });
  
  app.get("/api/movies/featured", async (req, res) => {
    const movies = await storage.getFeaturedMovies();
    res.json(movies);
  });
  
  app.get("/api/movies/category/:category", async (req, res) => {
    const category = req.params.category;
    const movies = await storage.getMoviesByCategory(category);
    res.json(movies);
  });
  
  app.get("/api/movies/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await storage.getMovie(id);
    
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    
    res.json(movie);
  });
  
  // Movie management (create/delete) - restricted to owners and members
  app.post("/api/movies", async (req, res) => {
    if (!canUploadContent(req)) {
      return res.status(403).json({ 
        message: "Only owners and members can upload movies" 
      });
    }
    
    try {
      const movieData = insertMovieSchema.parse(req.body);
      // Set the creator ID to the current user
      const movieWithCreator = {
        ...movieData,
        createdBy: req.user?.id
      };
      const newMovie = await storage.createMovie(movieWithCreator);
      res.status(201).json(newMovie);
    } catch (error) {
      res.status(400).json({ message: "Invalid movie data", error });
    }
  });
  
  app.delete("/api/movies/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const idSchema = z.number().int().positive();
    
    try {
      const id = idSchema.parse(parseInt(req.params.id));
      const movie = await storage.getMovie(id);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      // We know req.user exists after isAuthenticated check
      const user = req.user!;
      
      // Implement proper permission checks:
      // 1. Owner can delete any movie
      // 2. Members can only delete their own movies
      // 3. Visitors cannot delete any movies
      const isOwner = user.role === UserRole.OWNER;
      const isMember = user.role === UserRole.MEMBER;
      const isCreator = movie.createdBy === user.id;
      
      if (!(isOwner || (isMember && isCreator))) {
        return res.status(403).json({ 
          message: "Permission denied. You can only delete your own movies unless you're the owner." 
        });
      }
      
      const success = await storage.deleteMovie(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete movie" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // User profile routes
  app.patch("/api/user/profile-picture", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const profilePictureSchema = z.object({
      profilePicture: z.string().url("Profile picture must be a valid URL")
    });
    
    try {
      const { profilePicture } = profilePictureSchema.parse(req.body);
      // We know req.user exists after isAuthenticated check
      const userId = req.user!.id;
      
      const updatedUser = await storage.updateUserProfilePicture(userId, profilePicture);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile picture URL", error });
    }
  });
  
  // My List routes
  app.get("/api/user/my-list", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const savedMovies = await storage.getUserSavedMovies(userId);
      res.json(savedMovies);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve saved movies" });
    }
  });
  
  app.post("/api/user/my-list/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const idSchema = z.number().int().positive();
    
    try {
      const movieId = idSchema.parse(parseInt(req.params.movieId));
      const userId = req.user!.id;
      
      const movie = await storage.addMovieToUserList(userId, movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: "Invalid movie ID" });
    }
  });
  
  app.delete("/api/user/my-list/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const idSchema = z.number().int().positive();
    
    try {
      const movieId = idSchema.parse(parseInt(req.params.movieId));
      const userId = req.user!.id;
      
      const movie = await storage.removeMovieFromUserList(userId, movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: "Invalid movie ID" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
