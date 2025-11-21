import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMeeting } from "./gemini";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze-meeting", async (req, res) => {
    try {
      const requestSchema = z.object({
        meetingLink: z.string().min(1, "Meeting link required"),
        meetingType: z.string().min(1, "Meeting type required"),
        language: z.string().min(1, "Language required"),
        isDemo: z.boolean().optional().default(false),
        apiKey: z.string().optional(),
      });

      const { meetingLink, meetingType, language, isDemo, apiKey } = requestSchema.parse(req.body);

      // Create meeting record
      const meeting = await storage.createMeeting({
        meetingLink,
        meetingType,
        language,
      });

      // Analyze the meeting using Gemini
      const analysisResult = await analyzeMeeting(
        meetingLink,
        meetingType,
        language,
        isDemo,
        apiKey
      );

      // Store the analysis
      const analysis = await storage.createMeetingAnalysis({
        meetingId: meeting.id,
        summary: analysisResult.summary,
        decisions: analysisResult.decisions,
        actionItems: analysisResult.actionItems,
        blockers: analysisResult.blockers,
        sentimentTimeline: analysisResult.sentimentTimeline,
        emailDraft: analysisResult.emailDraft,
        duration: analysisResult.duration,
        participants: analysisResult.participants,
        mood: analysisResult.mood,
      });

      console.log("Analysis result from Gemini:", {
        summaryLength: analysisResult.summary?.length,
        decisionsCount: analysisResult.decisions?.length,
        actionItemsCount: analysisResult.actionItems?.length,
        blockersCount: analysisResult.blockers?.length,
        sentimentCount: analysisResult.sentimentTimeline?.length,
      });
      
      console.log("Analysis stored in database:", {
        id: analysis.id,
        summaryLength: analysis.summary?.length,
        decisionsCount: analysis.decisions?.length,
        actionItemsCount: analysis.actionItems?.length,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing meeting:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ 
          error: "Failed to analyze meeting",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  app.get("/api/meetings", async (_req, res) => {
    try {
      const analyses = await storage.getAllMeetingAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings/:id/toggle-favorite", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.toggleFavorite(id);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Meeting not found" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  app.post("/api/meetings/:id/notes", async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const updated = await storage.updateNotes(id, notes || "");
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Meeting not found" });
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      res.status(500).json({ error: "Failed to update notes" });
    }
  });

  app.post("/api/meetings/:id/transcript", async (req, res) => {
    try {
      const { id } = req.params;
      const { transcript } = req.body;
      const updated = await storage.updateTranscript(id, transcript || "");
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Meeting not found" });
      }
    } catch (error) {
      console.error("Error updating transcript:", error);
      res.status(500).json({ error: "Failed to update transcript" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
