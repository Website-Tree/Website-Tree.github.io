import { InsertUser, User, Movie } from "../shared/schema";

// Simulate a local storage session
let currentUser: User | null = null;

// Mock users data
const users: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // In a real app, this would be hashed
    isAdmin: true,
    isLocked: false,
  },
  {
    id: 2,
    username: "user1",
    password: "password", // In a real app, this would be hashed
    isAdmin: false,
    isLocked: false,
  }
];

// Mock movies data
const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    releaseYear: 2010,
    durationMinutes: 148,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/8hP9D6kZseM",
    category: "sci-fi",
    featured: true,
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseYear: 1994,
    durationMinutes: 142,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/6hB3S9bIaco",
    category: "drama",
    featured: true,
  },
  {
    id: 3,
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseYear: 2008,
    durationMinutes: 152,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    category: "action",
    featured: true,
  },
  {
    id: 4,
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    releaseYear: 1994,
    durationMinutes: 154,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
    category: "crime",
    featured: false,
  },
  {
    id: 5,
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    releaseYear: 1999,
    durationMinutes: 136,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/vKQi3bBA1y8",
    category: "sci-fi",
    featured: false,
  },
  {
    id: 6,
    title: "Forrest Gump",
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
    releaseYear: 1994,
    durationMinutes: 142,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/bLvqoHBptjg",
    category: "drama",
    featured: false,
  },
  {
    id: 7,
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    releaseYear: 2014,
    durationMinutes: 169,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    category: "sci-fi",
    featured: false,
  },
  {
    id: 8,
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    releaseYear: 1972,
    durationMinutes: 175,
    thumbnailUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    videoUrl: "https://www.youtube.com/embed/sY1S34973zA",
    category: "crime",
    featured: false,
  }
];

// Mock Authentication APIs
export const mockAuth = {
  login: async (credentials: { username: string; password: string }): Promise<User> => {
    const user = users.find(u => u.username === credentials.username);
    
    if (!user) {
      throw new Error("Invalid username or password");
    }
    
    if (user.password !== credentials.password) {
      throw new Error("Invalid username or password");
    }
    
    if (user.isLocked) {
      throw new Error("Your account has been locked. Please contact admin.");
    }
    
    // Set current user
    currentUser = user;
    return { ...user };
  },
  
  register: async (userData: InsertUser): Promise<User> => {
    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      throw new Error("Username already exists");
    }
    
    // Create new user
    const id = users.length + 1;
    const newUser: User = {
      ...userData,
      id,
      isAdmin: false, // New users are never admins by default
      isLocked: false
    };
    
    // Add to users array
    users.push(newUser);
    
    // Log in the new user
    currentUser = newUser;
    
    return { ...newUser };
  },
  
  logout: async (): Promise<void> => {
    currentUser = null;
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    return currentUser ? { ...currentUser } : null;
  },
  
  getAllUsers: async (): Promise<User[]> => {
    // Only admins can access all users
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("Unauthorized");
    }
    
    return users.map(user => ({ ...user }));
  },
  
  updateUserLockStatus: async (userId: number, isLocked: boolean): Promise<User> => {
    // Only admins can update lock status
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("Unauthorized");
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    // Cannot lock yourself
    if (userId === currentUser.id) {
      throw new Error("Cannot lock your own account");
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      isLocked
    };
    
    return { ...users[userIndex] };
  }
};

// Mock Movies APIs
export const mockMovies = {
  getAllMovies: async (): Promise<Movie[]> => {
    return movies.map(movie => ({ ...movie }));
  },
  
  getMoviesByCategory: async (category: string): Promise<Movie[]> => {
    return movies
      .filter(movie => movie.category === category)
      .map(movie => ({ ...movie }));
  },
  
  getMovie: async (id: number): Promise<Movie | null> => {
    const movie = movies.find(m => m.id === id);
    return movie ? { ...movie } : null;
  },
  
  getFeaturedMovies: async (): Promise<Movie[]> => {
    return movies
      .filter(movie => movie.featured)
      .map(movie => ({ ...movie }));
  }
};