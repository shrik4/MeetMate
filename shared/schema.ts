import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingLink: text("meeting_link").notNull(),
  meetingType: text("meeting_type").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingAnalyses = pgTable("meeting_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").references(() => meetings.id).notNull(),
  summary: text("summary").notNull(),
  decisions: jsonb("decisions").notNull().$type<string[]>(),
  actionItems: jsonb("action_items").notNull().$type<ActionItem[]>(),
  blockers: jsonb("blockers").notNull().$type<string[]>(),
  sentimentTimeline: jsonb("sentiment_timeline").notNull().$type<SentimentPoint[]>(),
  emailDraft: text("email_draft").notNull(),
  duration: integer("duration"),
  participants: integer("participants"),
  mood: text("mood"),
  transcript: text("transcript"),
  notes: text("notes"),
  isFavorite: integer("is_favorite").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
}

export interface SentimentPoint {
  timestamp: string;
  label: string;
  sentiment: number;
  description: string;
}

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingAnalysisSchema = createInsertSchema(meetingAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeetingAnalysis = z.infer<typeof insertMeetingAnalysisSchema>;
export type MeetingAnalysis = typeof meetingAnalyses.$inferSelect;
