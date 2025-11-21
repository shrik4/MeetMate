import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transcribeAudio, analyzeTranscript } from "./groq-service";
import { z } from "zod";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze meeting from video link
  app.post("/api/analyze-meeting", async (req, res) => {
    try {
      const schema = z.object({
        videoUrl: z.string().url(),
      });

      const { videoUrl } = schema.parse(req.body);

      // Extract title from URL or use default
      const title = new URL(videoUrl).hostname.split(".")[0] || "Meeting";

      // Create meeting record
      const meeting = await storage.createMeeting({
        videoUrl,
        title,
        transcription: "Processing...",
      });

      // For now, return placeholder (real implementation would download and transcribe video)
      const analysis = await storage.createMeetingAnalysis({
        meetingId: meeting.id,
        executiveSummary: "Meeting analysis in progress. Video transcription and AI analysis are being performed.",
        keyPoints: [
          "Key discussion point 1",
          "Key discussion point 2",
          "Key discussion point 3",
        ],
        actionItems: [
          {
            assignee: "Team Lead",
            task: "Follow up on action items",
            deadline: "2024-12-31",
          },
        ],
        sentiment: "Productive",
        efficiencyScore: 75,
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

      // Get analysis
      const analysis = await storage.getMeetingAnalysis(analysisId);
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
        <h2>Meeting Analysis Report</h2>
        <p><strong>Title:</strong> ${meeting.title}</p>
        <h3>Executive Summary</h3>
        <p>${analysis.executiveSummary}</p>
        <h3>Key Points</h3>
        <ul>${analysis.keyPoints.map((p) => `<li>${p}</li>`).join("")}</ul>
        <h3>Action Items</h3>
        <table border="1">
          <tr><th>Assignee</th><th>Task</th><th>Deadline</th></tr>
          ${analysis.actionItems.map((item) => `<tr><td>${item.assignee}</td><td>${item.task}</td><td>${item.deadline}</td></tr>`).join("")}
        </table>
        <h3>Sentiment</h3>
        <p>${analysis.sentiment} | Efficiency Score: ${analysis.efficiencyScore}/100</p>
      `;

      res.json({
        success: true,
        message: `Email would be sent to ${recipientEmail}`,
        emailPreview: htmlEmail,
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
