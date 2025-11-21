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
  getAllMeetingAnalyses(): Promise<MeetingAnalysis[]>;
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
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getMeetingAnalysis(meetingId: string): Promise<MeetingAnalysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.meetingId === meetingId
    );
  }

  async getAllMeetingAnalyses(): Promise<MeetingAnalysis[]> {
    return Array.from(this.analyses.values());
  }
}

export const storage = new MemStorage();
