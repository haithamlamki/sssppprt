import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

// Users Schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  
  // Shift schedule information
  shiftPattern: text("shift_pattern").notNull().default("2weeks_on_2weeks_off"), // 2weeks_on_2weeks_off, normal, flexible
  currentShiftStatus: text("current_shift_status").default("available"), // available, on_shift, off_shift
  nextShiftStart: timestamp("next_shift_start"),
  nextShiftEnd: timestamp("next_shift_end"),
  
  // User role and status
  role: text("role").notNull().default("employee"), // employee, admin, committee_member
  isActive: boolean("is_active").notNull().default(true),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Event Registrations Schema
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  status: text("status").notNull().default("confirmed"), // confirmed, waitlist, cancelled, attended
  notes: text("notes"),
  teamName: text("team_name"), // For team sports
  emergencyContact: text("emergency_contact"),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ 
  id: true, 
  registrationDate: true 
});
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  eventRegistrations: many(eventRegistrations),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
  results: many(results),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  event: one(events, {
    fields: [results.eventId],
    references: [events.id],
  }),
}));

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, event, registration
  relatedEventId: varchar("related_event_id").references(() => events.id, { onDelete: "set null" }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Forum Posts Schema
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("general"), // general, football, basketball, marathon, family
  relatedEventId: varchar("related_event_id").references(() => events.id, { onDelete: "set null" }),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ 
  id: true, 
  likesCount: true,
  commentsCount: true,
  createdAt: true, 
  updatedAt: true 
});
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

// Forum Comments Schema
export const forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type ForumComment = typeof forumComments.$inferSelect;

// Forum Likes Schema
export const forumLikes = pgTable("forum_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumLikeSchema = createInsertSchema(forumLikes).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertForumLike = z.infer<typeof insertForumLikeSchema>;
export type ForumLike = typeof forumLikes.$inferSelect;

// Forum Relations
export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [forumPosts.relatedEventId],
    references: [events.id],
  }),
  comments: many(forumComments),
  likes: many(forumLikes),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  user: one(users, {
    fields: [forumComments.userId],
    references: [users.id],
  }),
}));

export const forumLikesRelations = relations(forumLikes, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumLikes.postId],
    references: [forumPosts.id],
  }),
  user: one(users, {
    fields: [forumLikes.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [notifications.relatedEventId],
    references: [events.id],
  }),
}));

// Stats Schema (for homepage statistics)
export interface Stats {
  totalEvents: number;
  totalParticipants: number;
  totalAchievements: number;
  activeSports: number;
}

// Extended types for forum with user info
export interface ForumPostWithUser extends ForumPost {
  user: {
    id: string;
    fullName: string;
    department: string;
  };
  isLiked?: boolean;
}
