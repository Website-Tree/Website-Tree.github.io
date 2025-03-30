import { users, movies, type User, type InsertUser, type Movie, type InsertMovie, type UpdateProfile } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

// We're making our own internal models for the in-memory storage that are compatible with the schema
export interface InMemoryUser {
  id: number;
  username: string;
  password: string;
  email: string | null;
  emailVerified: boolean | null;
  verificationToken: string | null;
  displayName: string | null;
  profilePicture: string | null;
  profileColor: string | null;
  role: "owner" | "member" | "visitor";
  canCreateUsers: boolean;
  canDeleteUsers: boolean;
  canUploadMovies: boolean;
  isLocked: boolean;
  createdAt: Date;
  myList: number[]; // IDs of movies in the user's list
}

export interface InMemoryMovie {
  id: number;
  title: string;
  description: string | null;
  year: number | null;
  duration: string | null;
  quality: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  uploaderId: number;
  createdAt: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUser(id: number, update: Partial<User>): Promise<User>;
  updateUserProfile(id: number, profile: UpdateProfile): Promise<User>;
  createVerificationToken(userId: number): Promise<string>;
  verifyEmail(token: string): Promise<User | undefined>;
  
  // Movie methods
  getMovie(id: number): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  getRecentMovies(limit?: number): Promise<Movie[]>;
  getMoviesByUploader(uploaderId: number): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, update: Partial<Movie>): Promise<Movie>;
  deleteMovie(id: number): Promise<void>;
  
  // My List methods
  getUserMovieList(userId: number): Promise<Movie[]>;
  addMovieToUserList(userId: number, movieId: number): Promise<void>;
  removeMovieFromUserList(userId: number, movieId: number): Promise<void>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, InMemoryUser>;
  private movies: Map<number, InMemoryMovie>;
  private userIdCounter: number;
  private movieIdCounter: number;
  sessionStore: any; // Work around the type issue with express-session

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.userIdCounter = 1;
    this.movieIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    return user ? (user as unknown as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
    return user ? (user as unknown as User) : undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const user = Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
    return user ? (user as unknown as User) : undefined;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    if (!token) return undefined;
    const user = Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
    return user ? (user as unknown as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Determine the role
    const role = insertUser.role || 'visitor';
    
    // Function to get role-based default profile picture
    function getDefaultProfilePicture(role: string) {
      if (role === 'owner') {
        return '/images/owner/owner.png';
      } else if (role === 'member') {
        return '/images/member/member.png';
      } else {
        return '/images/visitor/visitor.png';
      }
    }
    
    // Always use the default profile picture based on role
    const profilePicture = getDefaultProfilePicture(role);
    
    // Create a properly typed InMemoryUser
    const user: InMemoryUser = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      emailVerified: false,
      verificationToken: null,
      displayName: insertUser.displayName || null,
      // Always use role-based profile picture, ignoring any provided profile picture
      profilePicture: profilePicture,
      profileColor: insertUser.profileColor || null,
      role: role,
      canCreateUsers: insertUser.canCreateUsers || false,
      canDeleteUsers: insertUser.canDeleteUsers || false,
      canUploadMovies: role === 'owner' || role === 'member' || insertUser.canUploadMovies || false,
      isLocked: false, // Default to not locked
      createdAt: now,
      myList: [] // Initialize with empty movie list
    };
    
    this.users.set(id, user);
    return user as unknown as User; // Type cast to satisfy the interface
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(user => user as unknown as User);
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const user = await this.getUser(id) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // Function to get role-based default profile picture
    function getDefaultProfilePicture(role: string) {
      if (role === 'owner') {
        return '/images/owner/owner.png';
      } else if (role === 'member') {
        return '/images/member/member.png';
      } else {
        return '/images/visitor/visitor.png';
      }
    }
    
    // Create a modified update that removes profilePicture
    const { profilePicture, ...cleanUpdate } = update as Partial<InMemoryUser>;
    
    // Type cast to ensure compatibility
    const updatedUser: InMemoryUser = { 
      ...user,
      ...cleanUpdate
    };
    
    // If role has changed, update profile picture to match the new role
    if (update.role && update.role !== user.role) {
      updatedUser.profilePicture = getDefaultProfilePicture(update.role);
    } else {
      // Ensure profile picture is set to role-based default
      updatedUser.profilePicture = getDefaultProfilePicture(updatedUser.role);
    }
    
    this.users.set(id, updatedUser);
    return updatedUser as unknown as User;
  }
  
  async updateUserProfile(id: number, profile: UpdateProfile): Promise<User> {
    const user = await this.getUser(id) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // If email is changing, reset verification status
    const emailChanged = profile.email && profile.email !== user.email;
    
    // Create properly typed updated user, maintaining the existing profile picture
    const updatedUser: InMemoryUser = { 
      ...user,
      email: profile.email ?? user.email,
      displayName: profile.displayName ?? user.displayName,
      // Keep the existing profile picture (should already be role-based)
      profileColor: profile.profileColor ?? user.profileColor,
      // Reset verification if email changes
      emailVerified: emailChanged ? false : user.emailVerified,
      // Clear verification token if email changes
      verificationToken: emailChanged ? null : user.verificationToken
    };
    
    this.users.set(id, updatedUser);
    return updatedUser as unknown as User;
  }
  
  async createVerificationToken(userId: number): Promise<string> {
    const user = await this.getUser(userId) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Generate a random token
    const token = randomBytes(32).toString('hex');
    
    // Update user with token
    const updatedUser: InMemoryUser = { 
      ...user, 
      verificationToken: token 
    };
    
    this.users.set(userId, updatedUser);
    return token;
  }
  
  async verifyEmail(token: string): Promise<User | undefined> {
    const user = await this.getUserByVerificationToken(token) as InMemoryUser;
    if (!user) {
      return undefined;
    }
    
    // Update user to verified status
    const updatedUser: InMemoryUser = {
      ...user,
      emailVerified: true,
      verificationToken: null // Clear the token after use
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser as unknown as User;
  }

  // Movie methods
  async getMovie(id: number): Promise<Movie | undefined> {
    const movie = this.movies.get(id);
    return movie ? (movie as unknown as Movie) : undefined;
  }

  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).map(movie => movie as unknown as Movie);
  }

  async getRecentMovies(limit: number = 10): Promise<Movie[]> {
    return Array.from(this.movies.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(movie => movie as unknown as Movie);
  }

  async getMoviesByUploader(uploaderId: number): Promise<Movie[]> {
    return Array.from(this.movies.values())
      .filter(movie => movie.uploaderId === uploaderId)
      .map(movie => movie as unknown as Movie);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieIdCounter++;
    const now = new Date();
    
    // Create properly typed InMemoryMovie
    const movie: InMemoryMovie = {
      id,
      title: insertMovie.title,
      description: insertMovie.description || null,
      year: insertMovie.year || null,
      duration: insertMovie.duration || null,
      quality: insertMovie.quality || null,
      thumbnailUrl: insertMovie.thumbnailUrl || null,
      videoUrl: insertMovie.videoUrl,
      uploaderId: insertMovie.uploaderId,
      createdAt: now
    };
    
    this.movies.set(id, movie);
    return movie as unknown as Movie; // Type cast to satisfy interface
  }

  async updateMovie(id: number, update: Partial<Movie>): Promise<Movie> {
    const movie = await this.getMovie(id) as InMemoryMovie;
    if (!movie) {
      throw new Error(`Movie with id ${id} not found`);
    }
    
    // Type cast to ensure compatibility
    const updatedMovie: InMemoryMovie = { 
      ...movie,
      ...(update as Partial<InMemoryMovie>)
    };
    
    this.movies.set(id, updatedMovie);
    return updatedMovie as unknown as Movie;
  }

  async deleteMovie(id: number): Promise<void> {
    this.movies.delete(id);
    
    // Remove movie from all users' lists
    Array.from(this.users.values()).forEach(user => {
      if (user.myList && user.myList.includes(id)) {
        user.myList = user.myList.filter((movieId: number) => movieId !== id);
      }
    });
  }
  
  // My List methods
  async getUserMovieList(userId: number): Promise<Movie[]> {
    const user = this.users.get(userId) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Get the movies in the user's list
    const moviePromises = user.myList.map(movieId => this.getMovie(movieId));
    const movies = await Promise.all(moviePromises);
    
    // Filter out any undefined movies (in case a movie was deleted)
    return movies.filter(movie => movie !== undefined) as Movie[];
  }
  
  async addMovieToUserList(userId: number, movieId: number): Promise<void> {
    const user = this.users.get(userId) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const movie = this.movies.get(movieId);
    if (!movie) {
      throw new Error(`Movie with id ${movieId} not found`);
    }
    
    // Add movie to list if not already present
    if (!user.myList.includes(movieId)) {
      user.myList.push(movieId);
      this.users.set(userId, user);
    }
  }
  
  async removeMovieFromUserList(userId: number, movieId: number): Promise<void> {
    const user = this.users.get(userId) as InMemoryUser;
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Remove movie from list
    user.myList = user.myList.filter(id => id !== movieId);
    this.users.set(userId, user);
  }
}

export const storage = new MemStorage();
