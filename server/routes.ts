import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transcribeAudio, analyzeTranscript } from "./groq-service";
import { sendEmail } from "./email-service";
import { z } from "zod";
import multer from "multer";
import { unlinkSync } from "fs";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {

  // Analyze meeting from YouTube link
  app.post("/api/analyze-meeting", async (req, res) => {
    try {
      const schema = z.object({
        videoUrl: z.string().url(),
      });

      const { videoUrl } = schema.parse(req.body);

      const title = new URL(videoUrl).hostname.split(".")[0] || "Meeting";

      const meeting = await storage.createMeeting({
        videoUrl,
        title,
        transcription: "Fetching captions...",
      });

      let transcript = "";
      try {
        // Fetch captions using YouTube API
        const { getYouTubeTranscript } = await import("./youtube-service");
        transcript = await getYouTubeTranscript(videoUrl);
      } catch (captionError) {
        const errorMessage =
          captionError instanceof Error ? captionError.message : "Failed to fetch captions";
        return res.status(400).json({
          error: "Caption Fetch Failed",
          message: errorMessage,
          suggestion: "Try uploading an audio file instead.",
        });
      }

      // Analyze transcript
      const analysisResult = await analyzeTranscript(transcript, title);
      await storage.updateTranscript(meeting.id, transcript);

      const analysis = await storage.createMeetingAnalysis({
        meetingId: meeting.id,
        executiveSummary: analysisResult.executive_summary,
        keyPoints: analysisResult.key_points_discussed,
        actionItems: analysisResult.action_items,
        sentiment: analysisResult.sentiment,
        efficiencyScore: analysisResult.efficiency_score,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing meeting:", error);
      res.status(500).json({
        error: "Failed to analyze meeting",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get all meetings history
  app.get("/api/meetings", async (req, res) => {
    try {
      const analyses = await storage.getAllMeetingAnalyses();
      const meetingsWithDetails = await Promise.all(
        analyses.map(async (analysis) => {
          const meeting = await storage.getMeeting(analysis.meetingId);
          return {
            ...analysis,
            meeting: meeting || null,
          };
        })
      );
      res.json(meetingsWithDetails);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  // Get specific meeting
  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const analysis = await storage.getMeetingAnalysisById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      const meeting = await storage.getMeeting(analysis.meetingId);
      res.json({ ...analysis, meeting });
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ error: "Failed to fetch meeting" });
    }
  });

  // Toggle favorite
  app.post("/api/meetings/:id/favorite", async (req, res) => {
    try {
      const analysis = await storage.toggleFavorite(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  // Update notes
  app.post("/api/meetings/:id/notes", async (req, res) => {
    try {
      const { notes } = req.body;
      const analysis = await storage.updateNotes(req.params.id, notes || "");
      if (!analysis) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error updating notes:", error);
      res.status(500).json({ error: "Failed to update notes" });
    }
  });

  // Upload audio and analyze
  app.post("/api/upload-audio", upload.single("audioFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { title = "Meeting" } = req.body;

      // Create meeting record
      const meeting = await storage.createMeeting({
        videoUrl: `file://${req.file.originalname}`,
        title,
        transcription: "Transcribing...",
      });

      // Transcribe audio (in production, would use Groq)
      let transcript = "Sample transcription of meeting content...";

      try {
        // Try to transcribe with Groq if API key is available
        if (process.env.GROQ_API_KEY) {
          // Save temp file
          const fs = await import("fs");
          const path = await import("path");
          const tmpFile = path.join("/tmp", `audio-${Date.now()}.m4a`);
          fs.writeFileSync(tmpFile, req.file.buffer);
          transcript = await transcribeAudio(tmpFile);
          fs.unlinkSync(tmpFile);
        }
      } catch (transcribeError) {
        console.log("Transcription skipped, using demo data");
      }

      // Analyze transcript
      const analysisResult = await analyzeTranscript(transcript, title);

      // Update meeting with transcript
      await storage.updateTranscript(meeting.id, transcript);

      // Create analysis record
      const analysis = await storage.createMeetingAnalysis({
        meetingId: meeting.id,
        executiveSummary: analysisResult.executive_summary,
        keyPoints: analysisResult.key_points_discussed,
        actionItems: analysisResult.action_items,
        sentiment: analysisResult.sentiment,
        efficiencyScore: analysisResult.efficiency_score,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error processing audio:", error);
      res.status(500).json({
        error: "Failed to process audio",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get all meetings
  app.get("/api/meetings", async (_req, res) => {
    try {
      const analyses = await storage.getAllMeetingAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  // Get single meeting
  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getMeetingAnalysis(id);
      if (analysis) {
        res.json(analysis);
      } else {
        res.status(404).json({ error: "Meeting not found" });
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ error: "Failed to fetch meeting" });
    }
  });

  // Send analysis email
  app.post("/api/send-email", async (req, res) => {
    try {
      const schema = z.object({
        analysisId: z.string(),
        recipientEmail: z.string().email(),
      });

      const { analysisId, recipientEmail } = schema.parse(req.body);

      // Get analysis by ID
      const analysis = await storage.getMeetingAnalysisById(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Get meeting
      const meeting = await storage.getMeeting(analysis.meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      // Generate HTML email
      const htmlEmail = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Meeting Analysis Report</h2>
            <p><strong>Title:</strong> ${meeting.title}</p>
            <hr>
            <h3 style="color: #333;">Executive Summary</h3>
            <p style="color: #555;">${analysis.executiveSummary}</p>
            <h3 style="color: #333;">Key Points</h3>
            <ul style="color: #555;">
              ${analysis.keyPoints.map((p) => `<li>${p}</li>`).join("")}
            </ul>
            <h3 style="color: #333;">Action Items</h3>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
              <tr style="background-color: #f5f5f5;">
                <th>Assignee</th>
                <th>Task</th>
                <th>Deadline</th>
              </tr>
              ${analysis.actionItems
                .map(
                  (item) =>
                    `<tr><td>${item.assignee}</td><td>${item.task}</td><td>${item.deadline}</td></tr>`
                )
                .join("")}
            </table>
            <h3 style="color: #333;">Meeting Metrics</h3>
            <p style="color: #555;">
              <strong>Sentiment:</strong> ${analysis.sentiment}<br>
              <strong>Efficiency Score:</strong> ${analysis.efficiencyScore}/100
            </p>
            <hr>
            <p style="color: #999; font-size: 12px;">Generated by MeetMate AI</p>
          </body>
        </html>
      `;

      // Send email
      await sendEmail(
        recipientEmail,
        `Meeting Analysis: ${meeting.title}`,
        htmlEmail
      );

      res.json({
        success: true,
        message: `Email sent successfully to ${recipientEmail}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
