import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events Schema
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // football, basketball, family, marathon, etc.
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, ongoing, completed
  requirements: text("requirements"),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// News Schema
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  category: text("category").notNull(), // announcement, result, achievement
});

export const insertNewsSchema = createInsertSchema(news).omit({ id: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Results/Achievements Schema
export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  tournamentName: text("tournament_name").notNull(),
  winner: text("winner").notNull(),
  runnerUp: text("runner_up"),
  thirdPlace: text("third_place"),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
});

export const insertResultSchema = createInsertSchema(results).omit({ id: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

// Featured Athletes Schema
export const athletes = pgTable("athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  achievements: text("achievements").notNull(),
  sport: text("sport").notNull(),
  imageUrl: text("image_url"),
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true });
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Athlete = typeof athletes.$inferSelect;

// Gallery Schema
export const gallery = pgTable("gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(), // football, family, marathon, basketball, etc.
  imageUrl: text("image_url").notNull(),
  eventDate: timestamp("event_date").notNull(),
  description: text("description"),
});

export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

// Stats Schema (for homepage statistics)
export interface Stats {
  totalEvents: number;
  totalParticipants: number;
  totalAchievements: number;
  activeSports: number;
}
