import {
  type Meeting,
  type InsertMeeting,
  type MeetingAnalysis,
  type InsertMeetingAnalysis,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeetingAnalysis(analysis: InsertMeetingAnalysis): Promise<MeetingAnalysis>;
  getMeetingAnalysis(meetingId: string): Promise<MeetingAnalysis | undefined>;
  getMeetingAnalysisById(analysisId: string): Promise<MeetingAnalysis | undefined>;
  getAllMeetingAnalyses(): Promise<MeetingAnalysis[]>;
  toggleFavorite(analysisId: string): Promise<MeetingAnalysis | undefined>;
  updateNotes(analysisId: string, notes: string): Promise<MeetingAnalysis | undefined>;
  updateTranscript(analysisId: string, transcript: string): Promise<MeetingAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private meetings: Map<string, Meeting>;
  private analyses: Map<string, MeetingAnalysis>;

  constructor() {
    this.meetings = new Map();
    this.analyses = new Map();
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async createMeetingAnalysis(
    insertAnalysis: InsertMeetingAnalysis
  ): Promise<MeetingAnalysis> {
    const id = randomUUID();
    const analysis: MeetingAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      transcript: null,
      notes: null,
      isFavorite: 0,
    } as MeetingAnalysis;
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getMeetingAnalysis(meetingId: string): Promise<MeetingAnalysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.meetingId === meetingId
    );
  }

  async getMeetingAnalysisById(analysisId: string): Promise<MeetingAnalysis | undefined> {
    return this.analyses.get(analysisId);
  }

  async getAllMeetingAnalyses(): Promise<MeetingAnalysis[]> {
    return Array.from(this.analyses.values());
  }

  async toggleFavorite(analysisId: string): Promise<MeetingAnalysis | undefined> {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      const updated = {
        ...analysis,
        isFavorite: analysis.isFavorite ? 0 : 1,
      };
      this.analyses.set(analysisId, updated);
      return updated;
    }
    return undefined;
  }

  async updateNotes(analysisId: string, notes: string): Promise<MeetingAnalysis | undefined> {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      const updated = { ...analysis, notes };
      this.analyses.set(analysisId, updated);
      return updated;
    }
    return undefined;
  }

  async updateTranscript(analysisId: string, transcript: string): Promise<MeetingAnalysis | undefined> {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      const updated = { ...analysis, transcript };
      this.analyses.set(analysisId, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
