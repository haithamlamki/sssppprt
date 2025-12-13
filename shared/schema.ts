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
  
  // Account type (نوع الحساب)
  accountType: text("account_type").notNull().default("standard"), // committee, player, standard
  committeeTitle: text("committee_title"), // المسمى في اللجنة (للأعضاء فقط)
  
  // Images (الصور)
  profileImageUrl: text("profile_image_url"), // صورة شخصية
  employeeCardImageUrl: text("employee_card_image_url"), // صورة بطاقة العمل
  nationalIdImageUrl: text("national_id_image_url"), // صورة الهوية
  
  // Player-specific fields (حقول اللاعب) - stored as JSON
  playerInfo: text("player_info"), // JSON: { number, position, level, dateOfBirth, healthStatus, primaryJersey, etc. }
  
  // Shift schedule information
  shiftPattern: text("shift_pattern").notNull().default("2weeks_on_2weeks_off"), // 2weeks_on_2weeks_off, normal, flexible
  currentShiftStatus: text("current_shift_status").default("available"), // available, on_shift, off_shift
  workStartDate: timestamp("work_start_date"), // تاريخ بداية العمل
  workEndDate: timestamp("work_end_date"), // تاريخ نهاية العمل
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

// ========== LEAGUE GENERATOR SCHEMAS ==========

// Tournaments/Leagues Schema
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  sport: text("sport").notNull(), // football, basketball, volleyball, etc.
  type: text("type").notNull(), // round_robin, knockout, groups
  status: text("status").notNull().default("registration"), // registration, ongoing, completed
  
  // Tournament settings
  maxTeams: integer("max_teams").notNull().default(8),
  minPlayersPerTeam: integer("min_players_per_team").notNull().default(5),
  maxPlayersPerTeam: integer("max_players_per_team").notNull().default(15),
  hasSecondLeg: boolean("has_second_leg").notNull().default(true), // ذهاب وإياب
  
  // Venue settings
  venues: text("venues").array(), // قائمة الملاعب
  
  // Multi-phase settings (groups → knockout)
  hasGroupStage: boolean("has_group_stage").notNull().default(false),
  numberOfGroups: integer("number_of_groups").default(2),
  teamsAdvancingPerGroup: integer("teams_advancing_per_group").default(2),
  
  // Stage tracking for groups → knockout tournaments
  currentStage: text("current_stage").default("registration"), // registration, group_stage, knockout_stage, completed
  groupStageComplete: boolean("group_stage_complete").notNull().default(false),
  knockoutBracket: text("knockout_bracket"), // JSON structure for bracket
  
  // Dates
  registrationStart: timestamp("registration_start"),
  registrationEnd: timestamp("registration_end"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Media
  imageUrl: text("image_url"),
  trophyImageUrl: text("trophy_image_url"), // صورة الكأس للعرض في شجرة خروج المغلوب
  
  // Theme customization - ثيم البطولة
  themeConfig: text("theme_config"), // JSON: { primaryColor, secondaryColor, useUnifiedImage }
  heroImageUrl: text("hero_image_url"), // صورة البانر الرئيسية
  standingsImageUrl: text("standings_image_url"), // صورة صفحة الترتيب
  matchesImageUrl: text("matches_image_url"), // صورة صفحة المباريات
  teamsImageUrl: text("teams_image_url"), // صورة صفحة الفرق
  scorersImageUrl: text("scorers_image_url"), // صورة صفحة الهدافين
  
  // Contact info (from myleague.vn form)
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  policy: text("policy").notNull().default("public"), // public, private
  
  // Points system
  pointsForWin: integer("points_for_win").notNull().default(3),
  pointsForDraw: integer("points_for_draw").notNull().default(1),
  pointsForLoss: integer("points_for_loss").notNull().default(0),
  
  // Round settings
  numberOfRounds: integer("number_of_rounds").default(1),
  
  // Registration
  isOpenForRegistration: boolean("is_open_for_registration").notNull().default(true),
  
  // Schedule configuration - JSON: { matchesPerDay, dailyStartTime, dailyEndTime }
  scheduleConfig: text("schedule_config"),
  
  // Tournament structure
  tournamentStructure: text("tournament_structure").default("team"), // team, individual
  numberOfVenues: integer("number_of_venues").default(1),
  excludedDays: text("excluded_days").array(), // ["friday", "saturday"]
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

// Teams Schema
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  captainId: varchar("captain_id").references(() => users.id),
  groupNumber: integer("group_number"), // For group stage tournaments
  
  // Team level and info (from myleague.vn)
  level: text("level"), // beginner, intermediate, advanced, professional
  averageAge: text("average_age"), // 18-25, 25-30, 30-35, 35+
  representativeName: text("representative_name"), // الممثل
  description: text("description"), // مقدمة الفريق
  
  // Jersey/Kit colors
  primaryJersey: text("primary_jersey"), // قميص 1 (اللون أو رابط الصورة)
  secondaryJersey: text("secondary_jersey"), // قميص 2
  thirdJersey: text("third_jersey"), // قميص 3
  
  // Contact info
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  activationZone: text("activation_zone"), // منطقة التفعيل
  activationPeriod: text("activation_period"), // الفترة الزمنية للتفعيل
  
  // Stats (computed/cached)
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  goalDifference: integer("goal_difference").notNull().default(0),
  points: integer("points").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({ 
  id: true, 
  played: true,
  won: true,
  drawn: true,
  lost: true,
  goalsFor: true,
  goalsAgainst: true,
  goalDifference: true,
  points: true,
  createdAt: true 
});
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Players Schema
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id), // Optional link to user account
  name: text("name").notNull(),
  number: integer("number"),
  position: text("position"), // goalkeeper, defender, midfielder, forward
  photoUrl: text("photo_url"),
  
  // Player info (from myleague.vn)
  level: text("level"), // beginner, intermediate, advanced, professional
  averageAge: text("average_age"), // 18-25, 25-30, 30-35, 35+
  dateOfBirth: timestamp("date_of_birth"),
  healthStatus: text("health_status").default("fit"), // fit, injured, recovering
  healthNotes: text("health_notes"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  representativeName: text("representative_name"), // الممثل
  activationZone: text("activation_zone"), // منطقة التفعيل
  activationPeriod: text("activation_period"), // الفترة الزمنية للتفعيل
  
  // Jersey/Kit for player
  primaryJersey: text("primary_jersey"), // قميص 1
  secondaryJersey: text("secondary_jersey"), // قميص 2
  thirdJersey: text("third_jersey"), // قميص 3
  
  // Stats
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  yellowCards: integer("yellow_cards").notNull().default(0),
  redCards: integer("red_cards").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ 
  id: true,
  goals: true,
  assists: true,
  yellowCards: true,
  redCards: true,
  matchesPlayed: true,
  createdAt: true 
});
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Referees Schema
export const referees = pgTable("referees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  level: text("level"), // beginner, intermediate, advanced, fifa
  specialization: text("specialization"), // main, assistant, var
  photoUrl: text("photo_url"),
  notes: text("notes"),
  matchesRefereed: integer("matches_refereed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRefereeSchema = createInsertSchema(referees).omit({ 
  id: true,
  matchesRefereed: true,
  createdAt: true 
});
export type InsertReferee = z.infer<typeof insertRefereeSchema>;
export type Referee = typeof referees.$inferSelect;

// Matches Schema
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  homeTeamId: varchar("home_team_id").notNull().references(() => teams.id),
  awayTeamId: varchar("away_team_id").notNull().references(() => teams.id),
  
  // Match info
  round: integer("round").notNull(), // الجولة
  leg: integer("leg").default(1), // 1 = ذهاب، 2 = إياب
  groupNumber: integer("group_number"), // For group stage
  stage: text("stage").default("group"), // group, round_of_16, quarter_final, semi_final, third_place, final
  
  // Knockout bracket positioning
  bracketPosition: integer("bracket_position"), // Position in knockout bracket (1, 2, 3... for ordering)
  nextMatchId: varchar("next_match_id"), // Winner advances to this match
  
  // Schedule
  matchDate: timestamp("match_date"),
  venue: text("venue"),
  
  // Result
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: text("status").notNull().default("scheduled"), // scheduled, live, completed, postponed
  
  // Extra time for knockout
  homeExtraTimeScore: integer("home_extra_time_score"),
  awayExtraTimeScore: integer("away_extra_time_score"),
  homePenaltyScore: integer("home_penalty_score"),
  awayPenaltyScore: integer("away_penalty_score"),
  
  // Match details
  referee: text("referee"),
  attendance: integer("attendance"),
  notes: text("notes"),
  
  // Video/Stream
  streamUrl: text("stream_url"),
  highlightsUrl: text("highlights_url"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Match Events (Goals, Cards, Substitutions)
export const matchEvents = pgTable("match_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  playerId: varchar("player_id").references(() => players.id),
  
  eventType: text("event_type").notNull(), // goal, own_goal, assist, yellow_card, red_card, substitution_in, substitution_out
  minute: integer("minute").notNull(),
  extraMinute: integer("extra_minute"), // وقت بدل الضائع
  
  // For substitutions
  relatedPlayerId: varchar("related_player_id").references(() => players.id),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchEventSchema = createInsertSchema(matchEvents).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type MatchEvent = typeof matchEvents.$inferSelect;

// Match Lineups
export const matchLineups = pgTable("match_lineups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  playerId: varchar("player_id").notNull().references(() => players.id),
  
  isStarter: boolean("is_starter").notNull().default(true),
  position: text("position"), // التشكيل
  positionNumber: integer("position_number"), // 1-11 للأساسيين
  
  // Performance evaluation
  rating: integer("rating"), // 1-10
  minutesPlayed: integer("minutes_played"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchLineupSchema = createInsertSchema(matchLineups).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertMatchLineup = z.infer<typeof insertMatchLineupSchema>;
export type MatchLineup = typeof matchLineups.$inferSelect;

// Match Comments (Fan interaction)
export const matchComments = pgTable("match_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchCommentSchema = createInsertSchema(matchComments).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertMatchComment = z.infer<typeof insertMatchCommentSchema>;
export type MatchComment = typeof matchComments.$inferSelect;

// Team Evaluations
export const teamEvaluations = pgTable("team_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  evaluatorId: varchar("evaluator_id").references(() => users.id),
  
  // Evaluation scores (1-10)
  attackRating: integer("attack_rating"),
  defenseRating: integer("defense_rating"),
  teamworkRating: integer("teamwork_rating"),
  disciplineRating: integer("discipline_rating"),
  overallRating: integer("overall_rating"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamEvaluationSchema = createInsertSchema(teamEvaluations).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertTeamEvaluation = z.infer<typeof insertTeamEvaluationSchema>;
export type TeamEvaluation = typeof teamEvaluations.$inferSelect;

// League Generator Relations
export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  teams: many(teams),
  matches: many(matches),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [teams.tournamentId],
    references: [tournaments.id],
  }),
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  players: many(players),
  homeMatches: many(matches),
  evaluations: many(teamEvaluations),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
  }),
  events: many(matchEvents),
  lineups: many(matchLineups),
  comments: many(matchComments),
  evaluations: many(teamEvaluations),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, {
    fields: [matchEvents.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchEvents.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [matchEvents.playerId],
    references: [players.id],
  }),
}));

export const matchLineupsRelations = relations(matchLineups, ({ one }) => ({
  match: one(matches, {
    fields: [matchLineups.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchLineups.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [matchLineups.playerId],
    references: [players.id],
  }),
}));

export const matchCommentsRelations = relations(matchComments, ({ one }) => ({
  match: one(matches, {
    fields: [matchComments.matchId],
    references: [matches.id],
  }),
  user: one(users, {
    fields: [matchComments.userId],
    references: [users.id],
  }),
}));

export const teamEvaluationsRelations = relations(teamEvaluations, ({ one }) => ({
  team: one(teams, {
    fields: [teamEvaluations.teamId],
    references: [teams.id],
  }),
  match: one(matches, {
    fields: [teamEvaluations.matchId],
    references: [matches.id],
  }),
  evaluator: one(users, {
    fields: [teamEvaluations.evaluatorId],
    references: [users.id],
  }),
}));

// Extended types for league with details
export interface MatchWithTeams extends Match {
  homeTeam: Team;
  awayTeam: Team;
}

export interface PlayerWithTeam extends Player {
  team: Team;
}

export interface MatchCommentWithUser extends MatchComment {
  user: {
    id: string;
    fullName: string;
  };
}

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
