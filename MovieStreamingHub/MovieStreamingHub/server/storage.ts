import { movies, type Movie, type InsertMovie, users, type User, type InsertUser } from "@shared/schema";
import path from "path";
import fs from "fs";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMovies(): Promise<Movie[]>;
  getMoviesByUserId(userId: number): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  userCurrentId: number;
  movieCurrentId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.userCurrentId = 1;
    this.movieCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMoviesByUserId(userId: number): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(
      (movie) => movie.userId === userId
    );
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieCurrentId++;
    const now = new Date();
    const movie: Movie = { 
      ...insertMovie, 
      id,
      uploadedAt: now
    };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: number, movieUpdate: Partial<InsertMovie>): Promise<Movie | undefined> {
    const movie = this.movies.get(id);
    if (!movie) return undefined;
    
    const updatedMovie: Movie = { ...movie, ...movieUpdate };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    const movie = this.movies.get(id);
    if (!movie) return false;
    
    // Remove files from disk
    try {
      if (movie.filePath && fs.existsSync(movie.filePath)) {
        fs.unlinkSync(movie.filePath);
      }
      if (movie.thumbnailPath && fs.existsSync(movie.thumbnailPath)) {
        fs.unlinkSync(movie.thumbnailPath);
      }
    } catch (error) {
      console.error('Error deleting movie files:', error);
    }
    
    return this.movies.delete(id);
  }
}

export const storage = new MemStorage();

// Populate with dummy user for testing
storage.createUser({
  username: "demo",
  password: "password123",
}).then(user => {
  console.log(`Created test user with ID: ${user.id}`);
});
