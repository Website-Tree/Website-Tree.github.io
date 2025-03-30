import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format").optional(),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const UserRole = {
  OWNER: "owner",
  MEMBER: "member",
  VISITOR: "visitor"
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  profilePicture: text("profile_picture"),
  role: text("role").notNull().default(UserRole.VISITOR),
  isAdmin: boolean("is_admin").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  lockReason: text("lock_reason"),
  verificationCode: text("verification_code"),
  isVerified: boolean("is_verified").notNull().default(false),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  category: text("category").notNull(),
  releaseYear: integer("release_year"),
  durationMinutes: integer("duration_minutes"),
  featured: boolean("featured").notNull().default(false),
  createdBy: integer("created_by"), // User ID of who created this movie
  savedByUsers: text("saved_by_users").array(), // Array of user IDs who saved this movie
});

export const insertUserSchema = createInsertSchema(users);

export const insertMovieSchema = createInsertSchema(movies);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
