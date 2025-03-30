import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertMovieSchema, movieCategorySchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Set up the upload directories
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, "thumbnails");

// Create directories if they don't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, VIDEOS_DIR);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, THUMBNAILS_DIR);
    } else {
      cb(new Error('Invalid field name'), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const videoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === "video") {
    // Accept video formats
    const filetypes = /mp4|mkv|avi|mov|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  } else if (file.fieldname === "thumbnail") {
    // Accept image formats for thumbnails
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed for thumbnails!'));
  } else {
    cb(new Error('Unexpected field'));
  }
};

const upload = multer({ 
  storage: storage_config, 
  fileFilter: videoFilter,
  limits: { fileSize: 1024 * 1024 * 1024 * 10 } // 10GB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleError = (err: any, res: Response) => {
    console.error(err);
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationError.details 
      });
    }
    res.status(500).json({ message: err.message || "Internal server error" });
  };

  // Get all movies
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get movie by ID
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get movies by user ID
  app.get("/api/users/:userId/movies", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const movies = await storage.getMoviesByUserId(userId);
      res.json(movies);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Upload a new movie
  app.post(
    "/api/movies", 
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (!files.video || !files.video.length) {
          return res.status(400).json({ message: "Video file is required" });
        }
        
        const videoFile = files.video[0];
        const thumbnailFile = files.thumbnail?.[0];
        
        // Validate movie data
        const { userId, title, description, category, year, isPublic, duration } = req.body;
        
        const movieData = {
          userId: parseInt(userId),
          title,
          description: description || "",
          category: category || "other",
          year: year || new Date().getFullYear().toString(),
          isPublic: isPublic === 'true',
          duration: parseInt(duration || '0'),
          filePath: videoFile.path,
          thumbnailPath: thumbnailFile?.path || ""
        };
        
        // Validate with Zod schema
        const validatedData = insertMovieSchema.parse(movieData);
        
        // Create movie in storage
        const movie = await storage.createMovie(validatedData);
        
        res.status(201).json(movie);
      } catch (err) {
        handleError(err, res);
      }
    }
  );

  // Update movie
  app.put("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      // Extract and validate update fields
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        year: req.body.year,
        isPublic: req.body.isPublic === 'true'
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      // Update movie
      const updatedMovie = await storage.updateMovie(id, updateData);
      
      res.json(updatedMovie);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Delete movie
  app.delete("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const success = await storage.deleteMovie(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete movie" });
      }
    } catch (err) {
      handleError(err, res);
    }
  });

  // Serve video files
  app.get("/api/videos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(VIDEOS_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Video file not found" });
    }
    
    // Stream the video file
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0]);
      const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
      const chunkSize = end - start + 1;
      
      // Create read stream for the range
      const stream = fs.createReadStream(filePath, { start, end });
      
      // Set response headers for chunked streaming
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4"
      });
      
      // Stream the chunk to the client
      stream.pipe(res);
    } else {
      // Stream the whole file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4"
      });
      
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Serve thumbnail files
  app.get("/api/thumbnails/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(THUMBNAILS_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }
    
    // Get file extension to determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/jpeg"; // Default
    
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    
    // Serve the thumbnail file
    res.setHeader("Content-Type", contentType);
    fs.createReadStream(filePath).pipe(res);
  });

  // API endpoint to get video categories
  app.get("/api/categories", (req, res) => {
    try {
      // Extract the enum values from the schema
      const categories = Object.values(movieCategorySchema.enum);
      res.json(categories);
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
