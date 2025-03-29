import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const codeSnippets = pgTable("codeSnippets", {
  id: serial("id").primaryKey(),
  language: text("language").notNull().default("javascript"),
  code: text("code").notNull(),
  title: text("title").notNull(),
  userId: integer("userId").references(() => users.id),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  language: true,
  code: true,
  title: true,
  userId: true,
});

export const aiPrompts = pgTable("aiPrompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  language: text("language").notNull().default("javascript"),
  userId: integer("userId").references(() => users.id),
  timestamp: text("timestamp").notNull(),
});

export const insertAiPromptSchema = createInsertSchema(aiPrompts).pick({
  prompt: true,
  response: true,
  language: true,
  userId: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;

export type InsertAiPrompt = z.infer<typeof insertAiPromptSchema>;
export type AiPrompt = typeof aiPrompts.$inferSelect;
