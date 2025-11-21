import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMeeting } from "./gemini";
import { transcribeAudioGoogle } from "./transcribe-google";
import { transcribeAudioHuggingFace } from "./transcribe-huggingface";
import { sendEmail, generateAnalysisEmail, generateNotificationEmail } from "./email";
import { z } from "zod";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Transcribe audio file and analyze
  app.post("/api/transcribe-and-analyze", upload.single("audioFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { meetingType = "Meeting", language = "English", apiKey, hfApiKey } = req.body;

      console.log("Transcribing audio file:", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      let transcript = "";
      let usedProvider = "huggingface";

      // Try Hugging Face first (required)
      try {
        const key = hfApiKey || process.env.HUGGING_FACE_API_KEY;
        if (!key) {
          throw new Error("Hugging Face API key is required. Set HUGGING_FACE_API_KEY environment variable or provide hfApiKey in request.");
        }
        transcript = await transcribeAudioHuggingFace(
          req.file.buffer,
          req.file.mimetype,
          key
        );
        usedProvider = "huggingface";
      } catch (hfError) {
        console.log("Hugging Face transcription failed:", hfError);
        // Try Google Cloud as fallback
        try {
          transcript = await transcribeAudioGoogle(req.file.buffer, req.file.mimetype);
          usedProvider = "google";
          console.log("Falling back to Google Cloud Speech-to-Text");
        } catch (googleError) {
          throw new Error(
            `Transcription failed. Hugging Face: ${hfError instanceof Error ? hfError.message : "unknown"}. Google Cloud: ${googleError instanceof Error ? googleError.message : "unknown"}`
          );
        }
      }

      console.log(`Transcription complete using ${usedProvider}, analyzing...`);

      // Create meeting record
      const meeting = await storage.createMeeting({
        meetingLink: req.file.originalname,
        meetingType,
        language,
      });

      // Analyze the transcript using Gemini
      const analysisResult = await analyzeMeeting(
        transcript,
        meetingType,
        language,
        false, // Not demo mode
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
        transcript,
      });

      res.json({
        ...analysis,
        transcriptionProvider: usedProvider,
      });
    } catch (error) {
      console.error("Error transcribing and analyzing:", error);
      res.status(500).json({
        error: "Failed to transcribe and analyze audio",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

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

  // Send analysis via email
  app.post("/api/send-analysis-email", async (req, res) => {
    try {
      const schema = z.object({
        analysisId: z.string(),
        recipientEmail: z.string().email(),
      });

      const { analysisId, recipientEmail } = schema.parse(req.body);

      // Get the analysis
      const analysis = await storage.getMeetingAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Get the meeting for context
      const meeting = await storage.getMeeting(analysis.meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      // Generate email content
      const htmlContent = generateAnalysisEmail(
        meeting.meetingType,
        analysis.summary,
        analysis.decisions,
        analysis.actionItems,
        analysis.blockers,
        analysis.mood || "Neutral"
      );

      // Send email
      await sendEmail({
        to: recipientEmail,
        subject: `Meeting Analysis: ${meeting.meetingType}`,
        html: htmlContent,
      });

      res.json({ success: true, message: "Analysis sent successfully" });
    } catch (error) {
      console.error("Error sending analysis email:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Send email draft
  app.post("/api/send-email-draft", async (req, res) => {
    try {
      const schema = z.object({
        analysisId: z.string(),
        recipientEmail: z.string().email(),
      });

      const { analysisId, recipientEmail } = schema.parse(req.body);

      // Get the analysis
      const analysis = await storage.getMeetingAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Send the pre-written email draft
      await sendEmail({
        to: recipientEmail,
        subject: "Follow-up from Meeting",
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><pre style="white-space: pre-wrap; word-wrap: break-word;">${analysis.emailDraft}</pre></div>`,
      });

      res.json({ success: true, message: "Email draft sent successfully" });
    } catch (error) {
      console.error("Error sending email draft:", error);
      res.status(500).json({
        error: "Failed to send email draft",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Send notification
  app.post("/api/send-notification", async (req, res) => {
    try {
      const schema = z.object({
        analysisId: z.string(),
        recipientEmail: z.string().email(),
      });

      const { analysisId, recipientEmail } = schema.parse(req.body);

      // Get the analysis
      const analysis = await storage.getMeetingAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Get the meeting for context
      const meeting = await storage.getMeeting(analysis.meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      // Send notification
      await sendEmail({
        to: recipientEmail,
        subject: `Your ${meeting.meetingType} Analysis is Ready`,
        html: generateNotificationEmail(meeting.meetingType),
      });

      res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({
        error: "Failed to send notification",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
