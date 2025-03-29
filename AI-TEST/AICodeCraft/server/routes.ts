import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCodeFromPrompt, generateCodeCompletions, analyzeCode } from "./openai";
import { insertAiPromptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI code generation endpoint
  app.post("/api/generate-code", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1).max(4000),
        language: z.string().default("javascript"),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { prompt, language } = result.data;
      
      const generatedCode = await generateCodeFromPrompt(prompt, language);
      
      // Store the prompt and response
      const timestamp = new Date().toISOString();
      const aiPromptData = {
        prompt,
        response: generatedCode,
        language,
        userId: 1, // Default to a guest user ID for now
        timestamp
      };
      
      // Save to memory storage
      // Note: In a real app, we'd save this to the database
      
      return res.status(200).json({ 
        code: generatedCode,
        language
      });
    } catch (error: any) {
      console.error("Error generating code:", error);
      return res.status(500).json({ 
        message: "Failed to generate code", 
        error: error.message
      });
    }
  });
  
  // Code completion endpoint
  app.post("/api/complete-code", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        code: z.string().min(1).max(8000),
        language: z.string().default("javascript"),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { code, language } = result.data;
      
      const completedCode = await generateCodeCompletions(code, language);
      
      return res.status(200).json({ 
        code: completedCode,
        language 
      });
    } catch (error: any) {
      console.error("Error completing code:", error);
      return res.status(500).json({ 
        message: "Failed to complete code", 
        error: error.message
      });
    }
  });
  
  // Code analysis endpoint
  app.post("/api/analyze-code", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        code: z.string().min(1).max(8000),
        language: z.string().default("javascript"),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { code, language } = result.data;
      
      const analysis = await analyzeCode(code, language);
      
      return res.status(200).json({ 
        analysis,
        language 
      });
    } catch (error: any) {
      console.error("Error analyzing code:", error);
      return res.status(500).json({ 
        message: "Failed to analyze code", 
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
