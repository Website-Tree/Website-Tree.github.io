import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export enum UserRole {
  OWNER = "owner",
  MEMBER = "member",
  VISITOR = "visitor"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  displayName: text("display_name"),
  profilePicture: text("profile_picture"),
  profileColor: text("profile_color"),
  role: text("role", { enum: ["owner", "member", "visitor"] }).notNull().default(UserRole.VISITOR),
  canCreateUsers: boolean("can_create_users").notNull().default(false),
  canDeleteUsers: boolean("can_delete_users").notNull().default(false),
  canUploadMovies: boolean("can_upload_movies").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  profilePicture: true,
  profileColor: true,
  role: true,
  canCreateUsers: true,
  canDeleteUsers: true,
  canUploadMovies: true
});

// Schema for updating user profile
export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  profilePicture: z.string().optional(),
  profileColor: z.string().optional()
});

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  year: integer("year"),
  duration: text("duration"),
  quality: text("quality"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  uploaderId: integer("uploader_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  year: true,
  duration: true,
  quality: true,
  thumbnailUrl: true,
  videoUrl: true,
  uploaderId: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
