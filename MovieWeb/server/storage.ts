import { users, movies, type User, type InsertUser, type Movie, type InsertMovie, UserRole } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserLockStatus(id: number, isLocked: boolean, lockReason?: string): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  updateUserEmail(id: number, email: string): Promise<User | undefined>;
  updateUserProfilePicture(id: number, profilePicture: string): Promise<User | undefined>;
  updateVerificationCode(id: number, code: string): Promise<User | undefined>;
  updateVerificationStatus(id: number, isVerified: boolean): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Movies
  getAllMovies(): Promise<Movie[]>;
  getMoviesByCategory(category: string): Promise<Movie[]>;
  getFeaturedMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  deleteMovie(id: number): Promise<boolean>;
  addMovieToUserList(userId: number, movieId: number): Promise<Movie | undefined>;
  removeMovieFromUserList(userId: number, movieId: number): Promise<Movie | undefined>;
  getUserSavedMovies(userId: number): Promise<Movie[]>;
  
  // Session store
  sessionStore: any; // Using any type to fix the SessionStore issue
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  currentId: number;
  movieId: number;
  sessionStore: any; // Using any type to fix the SessionStore issue

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.currentId = 1;
    this.movieId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add some sample movies
    this.initializeMovies();
    
    // Add owner account (Syfer-eng)
    // The password handling is done in auth.ts
    const owner = {
      id: this.currentId++,
      username: "Syfer-eng",
      password: "special-case-handled-in-auth", // This is just a placeholder
      email: "244977@antigoschools.org",
      profilePicture: "https://i.imgur.com/8RGfHYC.png", // Default owner profile picture
      role: UserRole.OWNER,
      isAdmin: true,
      isLocked: false,
      lockReason: null,
      verificationCode: null,
      isVerified: false
    } as User;
    
    this.users.set(owner.id, owner);
  }

  private initializeMovies() {
    // Not initializing with any sample movies
    // Only user-uploaded movies will be shown
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
    const id = this.currentId++;
    
    // Use the requested default profile picture
    const defaultProfilePicture = "https://raw.githubusercontent.com/Website-Tree/Website-Tree.github.io/refs/heads/main/MovieStreamHost/images/Default.png";
    
    // Set default values for required fields that might be missing
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || UserRole.VISITOR,
      isAdmin: insertUser.isAdmin || false,
      isLocked: insertUser.isLocked || false,
      lockReason: insertUser.lockReason || null,
      verificationCode: insertUser.verificationCode || null,
      isVerified: insertUser.isVerified || false,
      email: insertUser.email || null,
      profilePicture: defaultProfilePicture // Assign default profile picture based on role
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserLockStatus(id: number, isLocked: boolean, lockReason?: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isLocked, lockReason: lockReason || null };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Use the same default profile picture
    const newProfilePicture = "https://raw.githubusercontent.com/Website-Tree/Website-Tree.github.io/refs/heads/main/MovieStreamHost/images/Default.png";
    
    const updatedUser = { ...user, role, profilePicture: newProfilePicture };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserEmail(id: number, email: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, email };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserProfilePicture(id: number, profilePicture: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Let users change their profile pictures
    const updatedUser = { ...user, profilePicture };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const exists = this.users.has(id);
    if (!exists) return false;
    
    return this.users.delete(id);
  }
  
  async updateVerificationCode(id: number, code: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, verificationCode: code };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateVerificationStatus(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }
  
  async getMoviesByCategory(category: string): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(
      (movie) => movie.category === category
    );
  }
  
  async getFeaturedMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(
      (movie) => movie.featured
    );
  }
  
  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }
  
  async createMovie(movie: InsertMovie): Promise<Movie> {
    const id = this.movieId++;
    const newMovie = { ...movie, id };
    this.movies.set(id, newMovie as Movie);
    return newMovie as Movie;
  }
  
  async deleteMovie(id: number): Promise<boolean> {
    const exists = this.movies.has(id);
    if (!exists) return false;
    
    return this.movies.delete(id);
  }
  
  async addMovieToUserList(userId: number, movieId: number): Promise<Movie | undefined> {
    const movie = await this.getMovie(movieId);
    const user = await this.getUser(userId);
    
    if (!movie || !user) return undefined;
    
    // Initialize savedByUsers array if it doesn't exist
    if (!movie.savedByUsers) {
      movie.savedByUsers = [];
    }
    
    // Add userId to the savedByUsers array if not already present
    if (!movie.savedByUsers.includes(userId.toString())) {
      movie.savedByUsers.push(userId.toString());
      this.movies.set(movieId, movie);
    }
    
    return movie;
  }
  
  async removeMovieFromUserList(userId: number, movieId: number): Promise<Movie | undefined> {
    const movie = await this.getMovie(movieId);
    const user = await this.getUser(userId);
    
    if (!movie || !user) return undefined;
    
    // If savedByUsers exists, remove userId from it
    if (movie.savedByUsers && movie.savedByUsers.includes(userId.toString())) {
      movie.savedByUsers = movie.savedByUsers.filter(id => id !== userId.toString());
      this.movies.set(movieId, movie);
    }
    
    return movie;
  }
  
  async getUserSavedMovies(userId: number): Promise<Movie[]> {
    const user = await this.getUser(userId);
    
    if (!user) return [];
    
    // Get all movies that have this userId in their savedByUsers array
    return Array.from(this.movies.values()).filter(
      (movie) => movie.savedByUsers && movie.savedByUsers.includes(userId.toString())
    );
  }
}

export const storage = new MemStorage();
