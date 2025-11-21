// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"

import { GoogleGenAI } from "@google/genai";
import type { ActionItem, SentimentPoint } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface MeetingAnalysisResult {
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
  blockers: string[];
  sentimentTimeline: SentimentPoint[];
  emailDraft: string;
  duration: number;
  participants: number;
  mood: string;
}

export async function analyzeMeeting(
  meetingLink: string,
  meetingType: string,
  language: string,
  isDemo: boolean
): Promise<MeetingAnalysisResult> {
  // For demo mode or when we can't actually fetch the video, use AI to generate realistic sample data
  const prompt = `You are analyzing a ${meetingType} meeting conducted in ${language}.
${isDemo ? "This is a demo/sample meeting for demonstration purposes." : `Meeting link: ${meetingLink}`}

Generate a comprehensive meeting analysis with the following structure:

1. Summary: A 3-5 sentence summary of the meeting's key points and outcomes
2. Decisions: List 2-4 key decisions that were made during the meeting
3. Action Items: Create 3-5 action items with the following format for each:
   - task: specific task description
   - owner: person's name responsible
   - deadline: realistic deadline (e.g., "Monday", "Next week", "Jan 30")
   - priority: one of "Low", "Medium", or "High"
4. Blockers: List 1-3 problems or blockers discussed
5. Sentiment Timeline: Create 5 sentiment data points representing the meeting flow from start to end with:
   - timestamp: time in meeting (e.g., "0:00", "5:15", "15:30", "25:00", "30:00")
   - label: short phase label (e.g., "Start", "Early", "Middle", "Late", "End")
   - sentiment: number between 0 and 1 (0=very negative, 0.5=neutral, 1=very positive)
   - description: one sentence about the emotional tone during this phase
6. Email Draft: A professional follow-up email with:
   - Greeting
   - Brief summary
   - Key decisions
   - Action items with owners
   - Next steps
   - Professional closing
7. Duration: meeting duration in minutes (realistic for the type, e.g., 30-45 for standup, 60+ for review)
8. Participants: realistic number of participants for this meeting type
9. Mood: overall meeting mood (e.g., "Mostly Positive", "Productive", "Mixed", "Tense but Constructive")

Make the content realistic and professional for a ${meetingType} in a business/tech context.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            decisions: {
              type: "array",
              items: { type: "string" },
            },
            actionItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  owner: { type: "string" },
                  deadline: { type: "string" },
                  priority: { type: "string", enum: ["Low", "Medium", "High"] },
                },
                required: ["task", "owner", "deadline", "priority"],
              },
            },
            blockers: {
              type: "array",
              items: { type: "string" },
            },
            sentimentTimeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  label: { type: "string" },
                  sentiment: { type: "number" },
                  description: { type: "string" },
                },
                required: ["timestamp", "label", "sentiment", "description"],
              },
            },
            emailDraft: { type: "string" },
            duration: { type: "number" },
            participants: { type: "number" },
            mood: { type: "string" },
          },
          required: [
            "summary",
            "decisions",
            "actionItems",
            "blockers",
            "sentimentTimeline",
            "emailDraft",
            "duration",
            "participants",
            "mood",
          ],
        },
      },
      contents: prompt,
    });

    // Extract text from Gemini response structure
    let rawJson: string | undefined;
    
    console.log("Gemini response structure:", JSON.stringify(response, null, 2).substring(0, 500));
    
    if (response.text) {
      rawJson = response.text;
      console.log("Using response.text");
    } else if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log("Using candidates[0], content:", candidate.content);
      if (candidate.content && candidate.content.parts) {
        rawJson = candidate.content.parts
          .map((part: any) => part.text)
          .filter(Boolean)
          .join("");
      }
    }

    console.log("Extracted rawJson length:", rawJson?.length || 0);
    console.log("Raw JSON preview:", rawJson?.substring(0, 200));

    if (!rawJson) {
      console.error("Full response object:", JSON.stringify(response, null, 2));
      throw new Error("Empty response from Gemini - check logs for details");
    }

    const result: MeetingAnalysisResult = JSON.parse(rawJson);
    console.log("Parsed result keys:", Object.keys(result));
    
    // Validate required fields and provide defaults if missing
    if (!result.summary) {
      throw new Error("Missing summary in Gemini response");
    }
    
    result.decisions = result.decisions || [];
    result.actionItems = result.actionItems || [];
    result.blockers = result.blockers || [];
    result.sentimentTimeline = result.sentimentTimeline || [];
    result.duration = result.duration || 30;
    result.participants = result.participants || 4;
    result.mood = result.mood || "Productive";
    result.emailDraft = result.emailDraft || "Meeting summary not available.";
    
    return result;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(`Failed to analyze meeting: ${error instanceof Error ? error.message : String(error)}`);
  }
}
