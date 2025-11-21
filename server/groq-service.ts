import { Groq } from "groq-sdk";
import type { ActionItem } from "@shared/schema";

interface AnalysisResult {
  meeting_title: string;
  executive_summary: string;
  key_points_discussed: string[];
  action_items: ActionItem[];
  sentiment: string;
  efficiency_score: number;
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }
  return new Groq({ apiKey });
}

export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const groqClient = getGroqClient();
    const fs = await import("fs");
    const audioBuffer = fs.readFileSync(audioPath);

    const transcription = await groqClient.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.m4a", { type: "audio/mp4" }),
      model: "whisper-large-v3",
    });

    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function analyzeTranscript(
  transcript: string,
  meetingTitle: string
): Promise<AnalysisResult> {
  try {
    const groqClient = getGroqClient();
    
    const prompt = `You are MeetMate AI. Analyze this transcript from the meeting: "${meetingTitle}".

Respond with ONLY valid JSON (no markdown, no extra text):
{
  "meeting_title": "${meetingTitle}",
  "executive_summary": "2-3 sentence business summary of the meeting",
  "key_points_discussed": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "action_items": [
    {"assignee": "Name or Team", "task": "Task Description", "deadline": "Inferred deadline or 'TBD'"}
  ],
  "sentiment": "Productive/Tense/Informational/Positive",
  "efficiency_score": 0-100
}

Meeting Transcript:
${transcript}`;

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";

    // Parse JSON, handling potential formatting issues
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

    // Validate and normalize
    return {
      meeting_title: result.meeting_title || meetingTitle,
      executive_summary: result.executive_summary || "No summary available",
      key_points_discussed: Array.isArray(result.key_points_discussed)
        ? result.key_points_discussed
        : [],
      action_items: Array.isArray(result.action_items) ? result.action_items : [],
      sentiment: result.sentiment || "Neutral",
      efficiency_score: Math.min(100, Math.max(0, result.efficiency_score || 50)),
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error(`Failed to analyze transcript: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
