import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  duration: integer("duration"), // in seconds
  year: text("year"),
  userId: integer("user_id").notNull(),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  isPublic: boolean("is_public").default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  category: true,
  duration: true,
  year: true,
  userId: true,
  filePath: true,
  thumbnailPath: true,
  isPublic: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export const movieCategorySchema = z.enum([
  "action",
  "comedy",
  "drama",
  "documentary",
  "horror",
  "sci-fi",
  "adventure",
  "personal",
  "travel",
  "food",
  "other"
]);

export type MovieCategory = z.infer<typeof movieCategorySchema>;

export const videoQualitySchema = z.enum([
  "480p",
  "720p",
  "1080p"
]);

export type VideoQuality = z.infer<typeof videoQualitySchema>;

export const embedOptionsSchema = z.object({
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  hideControls: z.boolean().default(false),
  width: z.number().min(320).max(1920).default(640),
  height: z.number().min(180).max(1080).default(360),
  quality: videoQualitySchema.default("720p")
});

export type EmbedOptions = z.infer<typeof embedOptionsSchema>;
