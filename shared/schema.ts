import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoUrl: text("video_url").notNull(),
  title: text("title").notNull(),
  transcription: text("transcription").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingAnalyses = pgTable("meeting_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").references(() => meetings.id).notNull(),
  executiveSummary: text("executive_summary").notNull(),
  keyPoints: jsonb("key_points").notNull().$type<string[]>(),
  actionItems: jsonb("action_items").notNull().$type<ActionItem[]>(),
  sentiment: text("sentiment").notNull(),
  efficiencyScore: integer("efficiency_score").notNull(),
  isFavorite: integer("is_favorite").default(0).notNull(),
  notes: text("notes"),
  transcript: text("transcript"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface ActionItem {
  assignee: string;
  task: string;
  deadline: string;
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
