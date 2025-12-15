import { 
  type Event, 
  type InsertEvent,
  type News,
  type InsertNews,
  type Result,
  type InsertResult,
  type Athlete,
  type InsertAthlete,
  type Gallery,
  type InsertGallery,
  type Stats,
  type User,
  type InsertUser,
  type EventRegistration,
  type InsertEventRegistration,
  type Notification,
  type InsertNotification,
  type ForumPost,
  type InsertForumPost,
  type ForumComment,
  type InsertForumComment,
  type ForumLike,
  type InsertForumLike,
  type ForumPostWithUser,
  type Tournament,
  type InsertTournament,
  type Team,
  type InsertTeam,
  type Player,
  type InsertPlayer,
  type Match,
  type InsertMatch,
  type MatchEvent,
  type InsertMatchEvent,
  type MatchLineup,
  type InsertMatchLineup,
  type MatchComment,
  type InsertMatchComment,
  type TournamentComment,
  type InsertTournamentComment,
  type TeamChatMessage,
  type InsertTeamChatMessage,
  type MediaComment,
  type InsertMediaComment,
  type CommentReaction,
  type InsertCommentReaction,
  type PollVote,
  type InsertPollVote,
  type ChatMessage,
  type InsertChatMessage,
  type TeamEvaluation,
  type InsertTeamEvaluation,
  type Referee,
  type InsertReferee,
  type MatchWithTeams,
  type PlayerWithTeam,
  type MatchCommentWithUser,
  type SiteSetting,
  events,
  news,
  results,
  athletes,
  gallery,
  users,
  eventRegistrations,
  notifications,
  forumPosts,
  forumComments,
  forumLikes,
  tournaments,
  teams,
  players,
  matches,
  matchEvents,
  matchLineups,
  matchComments,
  tournamentComments,
  teamChatRooms,
  teamChatMessages,
  eventHubs,
  polls,
  pollVotes,
  mediaComments,
  commentReactions,
  chatRooms,
  chatRoomMembers,
  chatMessages,
  teamEvaluations,
  referees,
  siteSettings
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, asc, inArray } from "drizzle-orm";

// Helper to create a Date with proper Muscat timezone (UTC+4)
// This ensures the entered wall-clock time is preserved when stored/displayed
function createMuscatDate(dateStr: string, hour: number, minute: number): Date {
  // Format: YYYY-MM-DDTHH:mm:ss+04:00
  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoString = `${dateStr}T${pad(hour)}:${pad(minute)}:00+04:00`;
  return new Date(isoString);
}

// Helper to get date components in Muscat timezone using Intl.DateTimeFormat
function getMuscatDateComponents(date: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Muscat',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute')
  };
}

// Helper to get date string (YYYY-MM-DD) from a Date object in Muscat timezone
function getMuscatDateString(date: Date): string {
  const { year, month, day } = getMuscatDateComponents(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Helper to add days to a date string and return new date string
function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split('T')[0];
}

export interface IStorage {
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // News
  getAllNews(): Promise<News[]>;
  createNews(newsItem: InsertNews): Promise<News>;
  
  // Results
  getAllResults(): Promise<Result[]>;
  createResult(result: InsertResult): Promise<Result>;
  
  // Athletes
  getAllAthletes(): Promise<Athlete[]>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  
  // Gallery
  getAllGallery(): Promise<Gallery[]>;
  getGalleryByCategory(category: string): Promise<Gallery[]>;
  createGalleryItem(item: InsertGallery): Promise<Gallery>;
  
  // Stats
  getStats(): Promise<Stats>;
  
  // Users
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByEmployeeId(employeeId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Event Registrations
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getUserRegistrations(userId: string): Promise<EventRegistration[]>;
  getRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined>;
  deleteEventRegistration(id: string): Promise<boolean>;
  
  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  
  // Forum Posts
  getAllPosts(category?: string): Promise<ForumPostWithUser[]>;
  getPostById(id: string): Promise<ForumPostWithUser | undefined>;
  createPost(post: InsertForumPost): Promise<ForumPost>;
  deletePost(id: string, userId: string): Promise<boolean>;
  
  // Forum Comments
  getPostComments(postId: string): Promise<(ForumComment & { user: { fullName: string; department: string } })[]>;
  createComment(comment: InsertForumComment): Promise<ForumComment>;
  deleteComment(id: string, userId: string): Promise<boolean>;
  
  // Forum Likes
  toggleLike(postId: string, userId: string): Promise<boolean>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  
  // ========== LEAGUE GENERATOR ==========
  
  // Tournaments
  getAllTournaments(): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeamsByTournament(tournamentId: string): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  
  // Players
  getAllPlayers(): Promise<Player[]>;
  getPlayersByTeam(teamId: string): Promise<Player[]>;
  getPlayerById(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  getTopScorers(tournamentId: string, limit?: number): Promise<PlayerWithTeam[]>;
  
  // Referees
  getAllReferees(): Promise<Referee[]>;
  getRefereesByTournament(tournamentId: string): Promise<Referee[]>;
  getRefereeById(id: string): Promise<Referee | undefined>;
  createReferee(referee: InsertReferee): Promise<Referee>;
  updateReferee(id: string, updates: Partial<Referee>): Promise<Referee | undefined>;
  deleteReferee(id: string): Promise<boolean>;
  
  // Matches
  getMatchesByTournament(tournamentId: string): Promise<MatchWithTeams[]>;
  getMatchById(id: string): Promise<MatchWithTeams | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  generateLeagueMatches(tournamentId: string, options?: { matchesPerDay?: number; dailyStartTime?: string }): Promise<Match[]>;
  generateKnockoutMatchesFromGroups(tournamentId: string): Promise<Match[]>;
  
  // Group Stage Management
  assignTeamsToGroups(tournamentId: string, assignments?: { teamId: string; groupNumber: number }[]): Promise<Team[]>;
  getGroupStandings(tournamentId: string): Promise<{ groupNumber: number; teams: Team[] }[]>;
  generateGroupStageMatches(tournamentId: string, options?: { matchesPerDay?: number; dailyStartTime?: string }): Promise<Match[]>;
  completeGroupStage(tournamentId: string): Promise<{ tournament: Tournament; qualifiedTeams: Team[] }>;
  
  // Match Events
  getMatchEvents(matchId: string): Promise<MatchEvent[]>;
  createMatchEvent(event: InsertMatchEvent): Promise<MatchEvent>;
  deleteMatchEvent(id: string): Promise<boolean>;
  recalculatePlayerStats(tournamentId?: string): Promise<{ playersUpdated: number }>;
  
  // Match Lineups
  getMatchLineups(matchId: string, teamId?: string): Promise<MatchLineup[]>;
  createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup>;
  updateMatchLineup(id: string, updates: Partial<MatchLineup>): Promise<MatchLineup | undefined>;
  deleteMatchLineup(id: string): Promise<boolean>;
  
  // Match Comments
  getMatchComments(matchId: string): Promise<MatchCommentWithUser[]>;
  createMatchComment(comment: InsertMatchComment): Promise<MatchComment>;
  deleteMatchComment(id: string, userId: string): Promise<boolean>;
  
  // Tournament Comments
  getTournamentComments(tournamentId: string): Promise<(TournamentComment & { user: { id: string; fullName: string } })[]>;
  createTournamentComment(comment: InsertTournamentComment): Promise<TournamentComment>;
  deleteTournamentComment(id: string, userId: string): Promise<boolean>;
  
  // Team Chats
  getTeamChatRoom(teamId: string): Promise<{ id: string; teamId: string; name: string } | null>;
  getTeamChatMessages(roomId: string): Promise<(TeamChatMessage & { user: { id: string; fullName: string } })[]>;
  createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage>;
  checkTeamMemberAccess(teamId: string, userId: string): Promise<boolean>;
  
  // Event Hubs
  getEventHub(id: string): Promise<(typeof eventHubs.$inferSelect & { polls: any[] }) | null>;
  getEventHubs(tournamentId?: string, matchId?: string): Promise<typeof eventHubs.$inferSelect[]>;
  createEventHub(hub: { tournamentId?: string; matchId?: string; title: string; description?: string }): Promise<typeof eventHubs.$inferSelect>;
  getHubPolls(hubId: string): Promise<(typeof polls.$inferSelect & { votes: typeof pollVotes.$inferSelect[] })[]>;
  createPoll(poll: { hubId: string; question: string; type: string; options: string; closesAt?: Date }): Promise<typeof polls.$inferSelect>;
  votePoll(vote: InsertPollVote): Promise<PollVote>;
  getPollResults(pollId: string): Promise<{ option: string; votes: number; percentage: number }[]>;
  hasUserVoted(pollId: string, userId: string): Promise<boolean>;
  
  // Media Comments
  getMediaComments(mediaType: string, mediaId: string): Promise<(MediaComment & { user: { id: string; fullName: string } })[]>;
  createMediaComment(comment: InsertMediaComment): Promise<MediaComment>;
  deleteMediaComment(id: string, userId: string): Promise<boolean>;
  
  // Reactions
  addReaction(reaction: InsertCommentReaction): Promise<CommentReaction>;
  removeReaction(commentType: string, commentId: string, userId: string): Promise<boolean>;
  getCommentReactions(commentType: string, commentId: string): Promise<{ reactionType: string; count: number; userReaction?: string }[]>;
  
  // Private Chats
  getUserChatRooms(userId: string): Promise<(typeof chatRooms.$inferSelect & { members: { userId: string; fullName: string }[]; lastMessage?: { content: string; createdAt: Date } })[]>;
  createChatRoom(room: { type: string; name?: string; createdBy: string; memberIds: string[] }): Promise<typeof chatRooms.$inferSelect>;
  addChatMember(roomId: string, userId: string): Promise<void>;
  getChatMessages(roomId: string): Promise<(ChatMessage & { user: { id: string; fullName: string } })[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatAsRead(roomId: string, userId: string): Promise<void>;
  getUnreadCount(roomId: string, userId: string): Promise<number>;
  
  // Team Evaluations
  getTeamEvaluations(teamId: string): Promise<TeamEvaluation[]>;
  createTeamEvaluation(evaluation: InsertTeamEvaluation): Promise<TeamEvaluation>;
  
  // Standings
  updateTeamStandings(tournamentId: string): Promise<void>;
  
  // Site Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<SiteSetting>;
  
  // Initialization
  initializeSampleData(): Promise<void>;
  seedTeamsAndPlayers(): Promise<{ teamsCreated: number; playersCreated: number }>;
}

export class DatabaseStorage implements IStorage {
  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    // First delete all registrations for this event
    await db.delete(eventRegistrations).where(eq(eventRegistrations.eventId, id));
    // Then delete the event
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // News
  async getAllNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.date));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(insertNews).returning();
    return newsItem;
  }

  // Results
  async getAllResults(): Promise<Result[]> {
    return await db.select().from(results).orderBy(desc(results.date));
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await db.insert(results).values(insertResult).returning();
    return result;
  }

  // Athletes
  async getAllAthletes(): Promise<Athlete[]> {
    return await db.select().from(athletes);
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const [athlete] = await db.insert(athletes).values(insertAthlete).returning();
    return athlete;
  }

  // Gallery
  async getAllGallery(): Promise<Gallery[]> {
    return await db.select().from(gallery).orderBy(desc(gallery.eventDate));
  }

  async getGalleryByCategory(category: string): Promise<Gallery[]> {
    return await db.select().from(gallery)
      .where(eq(gallery.category, category))
      .orderBy(desc(gallery.eventDate));
  }

  async createGalleryItem(insertGallery: InsertGallery): Promise<Gallery> {
    const [galleryItem] = await db.insert(gallery).values(insertGallery).returning();
    return galleryItem;
  }

  // Stats
  async getStats(): Promise<Stats> {
    const [eventsCount] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [participantsSum] = await db.select({ 
      sum: sql<number>`coalesce(sum(${events.currentParticipants}), 0)` 
    }).from(events);
    const [achievementsCount] = await db.select({ count: sql<number>`count(*)` }).from(results);
    const [sportsCount] = await db.select({ 
      count: sql<number>`count(distinct ${events.category})` 
    }).from(events);

    return {
      totalEvents: Number(eventsCount.count),
      totalParticipants: Number(participantsSum.sum),
      totalAchievements: Number(achievementsCount.count),
      activeSports: Number(sportsCount.count),
    };
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.employeeId, employeeId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Event Registrations
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.registrationDate));
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(eventRegistrations.registrationDate));
  }

  async getRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId)
        )
      );
    return registration;
  }

  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values(insertRegistration)
      .returning();
    
    // Update event participant count
    await db
      .update(events)
      .set({ 
        currentParticipants: sql`${events.currentParticipants} + 1` 
      })
      .where(eq(events.id, insertRegistration.eventId));
    
    return registration;
  }

  async updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .update(eventRegistrations)
      .set(updates)
      .where(eq(eventRegistrations.id, id))
      .returning();
    return registration;
  }

  async deleteEventRegistration(id: string): Promise<boolean> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id));
    
    if (!registration) return false;
    
    // Decrease event participant count
    await db
      .update(events)
      .set({ 
        currentParticipants: sql`greatest(0, ${events.currentParticipants} - 1)` 
      })
      .where(eq(events.id, registration.eventId));
    
    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
    return true;
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result.count);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return true;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return true;
  }

  // Forum Posts
  async getAllPosts(category?: string): Promise<ForumPostWithUser[]> {
    const postsData = category
      ? await db
          .select()
          .from(forumPosts)
          .where(eq(forumPosts.category, category))
          .orderBy(desc(forumPosts.createdAt))
      : await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt));

    const postsWithUsers: ForumPostWithUser[] = [];
    for (const post of postsData) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
        department: users.department,
      }).from(users).where(eq(users.id, post.userId));
      
      if (user) {
        postsWithUsers.push({ ...post, user });
      }
    }
    return postsWithUsers;
  }

  async getPostById(id: string): Promise<ForumPostWithUser | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    if (!post) return undefined;

    const [user] = await db.select({
      id: users.id,
      fullName: users.fullName,
      department: users.department,
    }).from(users).where(eq(users.id, post.userId));

    if (!user) return undefined;
    return { ...post, user };
  }

  async createPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const [post] = await db.insert(forumPosts).values(insertPost).returning();
    return post;
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    if (!post || post.userId !== userId) return false;
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
    return true;
  }

  // Forum Comments
  async getPostComments(postId: string): Promise<(ForumComment & { user: { fullName: string; department: string } })[]> {
    const commentsData = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.postId, postId))
      .orderBy(forumComments.createdAt);

    const commentsWithUsers: (ForumComment & { user: { fullName: string; department: string } })[] = [];
    for (const comment of commentsData) {
      const [user] = await db.select({
        fullName: users.fullName,
        department: users.department,
      }).from(users).where(eq(users.id, comment.userId));
      
      if (user) {
        commentsWithUsers.push({ ...comment, user });
      }
    }
    return commentsWithUsers;
  }

  async createComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const [comment] = await db.insert(forumComments).values(insertComment).returning();
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({ commentsCount: sql`${forumPosts.commentsCount} + 1` })
      .where(eq(forumPosts.id, insertComment.postId));
    
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const [comment] = await db.select().from(forumComments).where(eq(forumComments.id, id));
    if (!comment || comment.userId !== userId) return false;
    
    await db.delete(forumComments).where(eq(forumComments.id, id));
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({ commentsCount: sql`greatest(0, ${forumPosts.commentsCount} - 1)` })
      .where(eq(forumPosts.id, comment.postId));
    
    return true;
  }

  // Forum Likes
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(forumLikes)
      .where(and(eq(forumLikes.postId, postId), eq(forumLikes.userId, userId)));

    if (existingLike) {
      await db.delete(forumLikes).where(eq(forumLikes.id, existingLike.id));
      await db
        .update(forumPosts)
        .set({ likesCount: sql`greatest(0, ${forumPosts.likesCount} - 1)` })
        .where(eq(forumPosts.id, postId));
      return false; // unliked
    } else {
      await db.insert(forumLikes).values({ postId, userId });
      await db
        .update(forumPosts)
        .set({ likesCount: sql`${forumPosts.likesCount} + 1` })
        .where(eq(forumPosts.id, postId));
      return true; // liked
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(forumLikes)
      .where(and(eq(forumLikes.postId, postId), eq(forumLikes.userId, userId)));
    return !!like;
  }

  // Initialize sample data
  async initializeSampleData(): Promise<void> {
    // Check if we already have data
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length > 0) {
      console.log("Sample data already exists, skipping initialization");
      return;
    }

    console.log("Initializing sample data...");

    // Sample Users (for testing)
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await db.insert(users).values([
      {
        username: "ahmed.ali",
        password: hashedPassword,
        fullName: "أحمد علي الشمري",
        email: "ahmed.ali@abraj.com",
        employeeId: "EMP001",
        department: "قسم الهندسة",
        position: "مهندس كهرباء",
        phoneNumber: "0501234567",
        shiftPattern: "2weeks_on_2weeks_off",
        role: "employee",
      },
      {
        username: "admin",
        password: hashedPassword,
        fullName: "مدير اللجنة الرياضية",
        email: "admin@abraj.com",
        employeeId: "ADM001",
        department: "اللجنة الرياضية",
        position: "مدير اللجنة",
        phoneNumber: "0507654321",
        shiftPattern: "normal",
        role: "admin",
      },
      {
        username: "haithamlamki",
        password: hashedPassword,
        fullName: "حساب مسؤول النظام",
        email: "haithamlamki@gmail.com",
        employeeId: "SYS001",
        department: "نظم المعلومات",
        position: "مسؤول النظام",
        phoneNumber: "",
        shiftPattern: "normal",
        role: "admin",
      },
    ]);

    // Sample Events
    await db.insert(events).values([
      {
        title: "بطولة كرة القدم السنوية",
        description: "بطولة كرة القدم السنوية للشركة - 16 فريق يتنافسون على كأس البطولة",
        category: "football",
        date: new Date(2025, 2, 15, 16, 0),
        location: "ملعب الشركة الرئيسي",
        maxParticipants: 160,
        currentParticipants: 128,
        imageUrl: "/assets/football.png",
        status: "upcoming",
        requirements: "جميع الموظفين مرحب بهم - يجب التسجيل ضمن فريق",
      },
      {
        title: "اليوم الرياضي العائلي",
        description: "يوم مليء بالأنشطة الترفيهية للموظفين وعائلاتهم مع مسابقات وجوائز",
        category: "family",
        date: new Date(2025, 2, 22, 10, 0),
        location: "حديقة الواحة الترفيهية",
        maxParticipants: 500,
        currentParticipants: 342,
        imageUrl: "/assets/family.png",
        status: "upcoming",
        requirements: "مفتوح لجميع الموظفين وعائلاتهم - التسجيل المسبق مطلوب",
      },
      {
        title: "ماراثون أبراج الخيري",
        description: "ماراثون 10 كم للموظفين بهدف خيري - كل المشاركة تذهب للجمعيات الخيرية",
        category: "marathon",
        date: new Date(2025, 3, 5, 6, 0),
        location: "كورنيش المدينة",
        maxParticipants: 300,
        currentParticipants: 245,
        imageUrl: "/assets/marathon.png",
        status: "upcoming",
        requirements: "مستوى لياقة متوسط - فحص طبي مطلوب",
      },
      {
        title: "دوري كرة السلة الداخلي",
        description: "دوري كرة السلة بنظام المجموعات - 8 فرق يتنافسون",
        category: "basketball",
        date: new Date(2025, 3, 20, 18, 0),
        location: "الصالة الرياضية المغطاة",
        maxParticipants: 80,
        currentParticipants: 64,
        imageUrl: "/assets/basketball.png",
        status: "upcoming",
        requirements: "التسجيل مفتوح حتى نفاد الأماكن",
      },
    ]);

    // Sample News
    await db.insert(news).values([
      {
        title: "فريق الهندسة يتوج بطلاً لدوري كرة القدم الداخلي",
        content: "في مباراة نهائية مثيرة، تمكن فريق قسم الهندسة من التتويج بلقب بطولة كرة القدم الداخلية بعد فوزه على فريق المالية بنتيجة 3-2",
        date: new Date(),
        category: "result",
      },
      {
        title: "التسجيل مفتوح الآن لبطولة كرة السلة السنوية",
        content: "يسر اللجنة الرياضية أن تعلن عن فتح باب التسجيل لبطولة كرة السلة السنوية. آخر موعد للتسجيل 10 مارس 2025",
        date: new Date(),
        category: "announcement",
      },
    ]);

    // Sample Results
    await db.insert(results).values([
      {
        eventId: null,
        tournamentName: "بطولة كرة القدم السنوية 2024",
        winner: "فريق الهندسة",
        runnerUp: "فريق المالية",
        thirdPlace: "فريق التشغيل",
        date: new Date(2024, 11, 15),
        category: "football",
      },
      {
        eventId: null,
        tournamentName: "دوري كرة السلة الداخلي 2024",
        winner: "فريق تقنية المعلومات",
        runnerUp: "فريق الموارد البشرية",
        thirdPlace: "فريق المشتريات",
        date: new Date(2024, 10, 20),
        category: "basketball",
      },
    ]);

    // Sample Athletes
    await db.insert(athletes).values([
      {
        name: "عبدالله الشمري",
        position: "مهندس كهرباء",
        department: "قسم الهندسة",
        achievements: "هداف بطولة كرة القدم 2024 (18 هدف)",
        sport: "كرة قدم",
        imageUrl: null,
      },
      {
        name: "سارة القحطاني",
        position: "محلل أعمال",
        department: "قسم تقنية المعلومات",
        achievements: "أفضل لاعبة في دوري كرة السلة النسائي",
        sport: "كرة سلة",
        imageUrl: null,
      },
    ]);

    // Sample Gallery
    await db.insert(gallery).values([
      {
        title: "نهائي بطولة كرة القدم 2024",
        category: "football",
        imageUrl: "/assets/football.png",
        eventDate: new Date(2024, 11, 15),
        description: "لحظات التتويج من نهائي بطولة كرة القدم السنوية",
      },
      {
        title: "اليوم العائلي الترفيهي",
        category: "family",
        imageUrl: "/assets/family.png",
        eventDate: new Date(2024, 10, 10),
        description: "أجواء مليئة بالمرح والسعادة مع العائلات",
      },
    ]);

    console.log("Sample data initialized successfully!");
  }

  // Seed sample teams and players
  async seedTeamsAndPlayers(): Promise<{ teamsCreated: number; playersCreated: number }> {
    console.log("Seeding teams and players...");

    // Sample Teams
    const sampleTeams = [
      {
        name: "فريق الهندسة",
        level: "advanced",
        averageAge: "25-30",
        representativeName: "محمد الشمري",
        contactPhone: "0501234567",
        contactEmail: "engineering.team@abraj.com",
        description: "فريق قسم الهندسة - بطل الموسم السابق",
        primaryJersey: "أزرق",
        secondaryJersey: "أبيض",
      },
      {
        name: "فريق المالية",
        level: "intermediate",
        averageAge: "30-35",
        representativeName: "خالد العتيبي",
        contactPhone: "0502345678",
        contactEmail: "finance.team@abraj.com",
        description: "فريق قسم المالية والمحاسبة",
        primaryJersey: "أخضر",
        secondaryJersey: "أسود",
      },
      {
        name: "فريق التشغيل",
        level: "advanced",
        averageAge: "25-30",
        representativeName: "سعود الحربي",
        contactPhone: "0503456789",
        contactEmail: "operations.team@abraj.com",
        description: "فريق قسم التشغيل والصيانة",
        primaryJersey: "أحمر",
        secondaryJersey: "أبيض",
      },
      {
        name: "فريق تقنية المعلومات",
        level: "professional",
        averageAge: "25-30",
        representativeName: "فهد القحطاني",
        contactPhone: "0504567890",
        contactEmail: "it.team@abraj.com",
        description: "فريق قسم تقنية المعلومات",
        primaryJersey: "أسود",
        secondaryJersey: "برتقالي",
      },
      {
        name: "فريق الموارد البشرية",
        level: "beginner",
        averageAge: "30-35",
        representativeName: "عبدالرحمن السبيعي",
        contactPhone: "0505678901",
        contactEmail: "hr.team@abraj.com",
        description: "فريق قسم الموارد البشرية",
        primaryJersey: "بنفسجي",
        secondaryJersey: "رمادي",
      },
      {
        name: "فريق المشتريات",
        level: "intermediate",
        averageAge: "25-30",
        representativeName: "ناصر الدوسري",
        contactPhone: "0506789012",
        contactEmail: "procurement.team@abraj.com",
        description: "فريق قسم المشتريات واللوجستيات",
        primaryJersey: "ذهبي",
        secondaryJersey: "كحلي",
      },
    ];

    const createdTeams = await db.insert(teams).values(sampleTeams).returning();

    // Sample Players for each team
    const playerPositions = ["goalkeeper", "defender", "midfielder", "forward"];
    const playerLevels = ["beginner", "intermediate", "advanced", "professional"];
    const arabicNames = [
      "عبدالله الشمري", "محمد القحطاني", "أحمد العتيبي", "خالد الحربي",
      "سعد السبيعي", "فهد الدوسري", "ناصر المطيري", "سلطان الغامدي",
      "عمر الزهراني", "يوسف البيشي", "إبراهيم العسيري", "حسن الشهري",
      "علي القرني", "صالح الأسمري", "ماجد الرشيدي", "بندر العنزي",
      "تركي السهلي", "راشد الوادعي", "مشاري الجهني", "عادل الخالدي",
      "هاني المالكي", "زياد الحازمي", "رامي الثقفي", "باسم الزيلعي",
    ];

    const allPlayers: any[] = [];
    let playerIndex = 0;

    for (const team of createdTeams) {
      // Create 4 players per team
      for (let i = 0; i < 4; i++) {
        if (playerIndex >= arabicNames.length) break;
        
        allPlayers.push({
          teamId: team.id,
          name: arabicNames[playerIndex],
          number: (i + 1) * 10 + Math.floor(Math.random() * 9),
          position: playerPositions[i % 4],
          level: playerLevels[Math.floor(Math.random() * 4)],
          averageAge: ["18-25", "25-30", "30-35"][Math.floor(Math.random() * 3)],
          phone: `050${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `${arabicNames[playerIndex].split(" ")[0].toLowerCase()}@abraj.com`,
          healthStatus: "fit",
        });
        playerIndex++;
      }
    }

    await db.insert(players).values(allPlayers);

    console.log(`Seeded ${createdTeams.length} teams and ${allPlayers.length} players!`);
    return { teamsCreated: createdTeams.length, playersCreated: allPlayers.length };
  }

  // ========== LEAGUE GENERATOR IMPLEMENTATIONS ==========

  // Tournaments
  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  }

  async getTournamentById(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db.insert(tournaments).values(insertTournament).returning();
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [tournament] = await db
      .update(tournaments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return tournament;
  }

  async deleteTournament(id: string): Promise<boolean> {
    await db.delete(tournaments).where(eq(tournaments.id, id));
    return true;
  }

  // Teams
  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(desc(teams.createdAt));
  }

  async getTeamsByTournament(tournamentId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.tournamentId, tournamentId))
      .orderBy(desc(teams.points), desc(teams.goalDifference), desc(teams.goalsFor));
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const [team] = await db.update(teams).set(updates).where(eq(teams.id, id)).returning();
    return team;
  }

  async deleteTeam(id: string): Promise<boolean> {
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  }

  // Players
  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players).orderBy(desc(players.createdAt));
  }

  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(players.number);
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
    return player;
  }

  async deletePlayer(id: string): Promise<boolean> {
    await db.delete(players).where(eq(players.id, id));
    return true;
  }

  async getTopScorers(tournamentId: string, limit: number = 10): Promise<PlayerWithTeam[]> {
    const tournamentTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.tournamentId, tournamentId));
    
    const teamIds = tournamentTeams.map(t => t.id);
    if (teamIds.length === 0) return [];

    // Get all matches for this tournament
    const tournamentMatches = await db
      .select({ id: matches.id })
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId));
    const matchIds = tournamentMatches.map(m => m.id);

    // Get all goal events for this tournament (only 'goal', exclude 'own_goal')
    let goalEvents: typeof matchEvents.$inferSelect[] = [];
    if (matchIds.length > 0) {
      goalEvents = await db
        .select()
        .from(matchEvents)
        .where(and(
          inArray(matchEvents.matchId, matchIds),
          eq(matchEvents.eventType, 'goal')
        ));
    }

    // Get all match events (any type) to calculate matches played
    let allPlayerEvents: typeof matchEvents.$inferSelect[] = [];
    if (matchIds.length > 0) {
      allPlayerEvents = await db
        .select()
        .from(matchEvents)
        .where(and(
          inArray(matchEvents.matchId, matchIds),
          sql`${matchEvents.playerId} IS NOT NULL`
        ));
    }

    // Count goals by player (only count events with playerId and eventType 'goal')
    const goalsByPlayer: Record<string, number> = {};
    for (const event of goalEvents) {
      // Double check: only count 'goal' type, exclude 'own_goal', and must have playerId
      if (event.playerId && event.eventType === 'goal') {
        goalsByPlayer[event.playerId] = (goalsByPlayer[event.playerId] || 0) + 1;
      }
    }

    // Count unique matches played by each player (from all events, not just goals)
    const matchesByPlayer: Record<string, Set<string>> = {};
    for (const event of allPlayerEvents) {
      if (event.playerId && event.matchId) {
        if (!matchesByPlayer[event.playerId]) {
          matchesByPlayer[event.playerId] = new Set();
        }
        matchesByPlayer[event.playerId].add(event.matchId);
      }
    }

    // Get all players from tournament teams
    const allPlayers = await db
      .select()
      .from(players)
      .where(inArray(players.teamId, teamIds));

    // Create scorer entries with actual goal counts and matches played from events
    const scorers: PlayerWithTeam[] = [];
    for (const player of allPlayers) {
      const actualGoals = goalsByPlayer[player.id] || 0;
      if (actualGoals > 0 && player.teamId) {
        const team = tournamentTeams.find(t => t.id === player.teamId);
        if (team) {
          const actualMatchesPlayed = matchesByPlayer[player.id]?.size || 0;
          scorers.push({ 
            ...player, 
            goals: actualGoals, // Use actual count from events
            matchesPlayed: actualMatchesPlayed, // Use actual count from events
            team 
          });
        }
      }
    }

    // Sort by goals (descending) and limit
    scorers.sort((a, b) => b.goals - a.goals);
    
    // Debug logging
    console.log(`[getTopScorers] Tournament: ${tournamentId}, Found ${scorers.length} scorers`);
    if (scorers.length > 0) {
      console.log(`[getTopScorers] Top 3:`, scorers.slice(0, 3).map(s => ({ name: s.name, goals: s.goals })));
    }
    
    return scorers.slice(0, limit);
  }

  // Referees
  async getAllReferees(): Promise<Referee[]> {
    return await db.select().from(referees).orderBy(desc(referees.createdAt));
  }

  async getRefereesByTournament(tournamentId: string): Promise<Referee[]> {
    return await db.select().from(referees).where(eq(referees.tournamentId, tournamentId));
  }

  async getRefereeById(id: string): Promise<Referee | undefined> {
    const [referee] = await db.select().from(referees).where(eq(referees.id, id));
    return referee;
  }

  async createReferee(insertReferee: InsertReferee): Promise<Referee> {
    const [referee] = await db.insert(referees).values(insertReferee).returning();
    return referee;
  }

  async updateReferee(id: string, updates: Partial<Referee>): Promise<Referee | undefined> {
    const [referee] = await db.update(referees).set(updates).where(eq(referees.id, id)).returning();
    return referee;
  }

  async deleteReferee(id: string): Promise<boolean> {
    await db.delete(referees).where(eq(referees.id, id));
    return true;
  }

  // Matches
  async getMatchesByTournament(tournamentId: string): Promise<MatchWithTeams[]> {
    const matchesList = await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(asc(matches.round), asc(matches.matchDate));

    const matchesWithTeams: MatchWithTeams[] = [];
    for (const match of matchesList) {
      // Handle matches with null team IDs (knockout matches before teams are assigned)
      let homeTeam = null;
      let awayTeam = null;
      
      if (match.homeTeamId) {
        const [team] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId));
        homeTeam = team || null;
      }
      
      if (match.awayTeamId) {
        const [team] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId));
        awayTeam = team || null;
      }
      
      // Include all matches (even those with null teams for knockout placeholders)
      matchesWithTeams.push({ ...match, homeTeam, awayTeam } as MatchWithTeams);
    }
    return matchesWithTeams;
  }

  async getMatchById(id: string): Promise<MatchWithTeams | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match) return undefined;

    // Handle matches with null team IDs (knockout matches before teams are assigned)
    let homeTeam = null;
    let awayTeam = null;
    
    if (match.homeTeamId) {
      const [team] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId));
      homeTeam = team || null;
    }
    
    if (match.awayTeamId) {
      const [team] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId));
      awayTeam = team || null;
    }

    return { ...match, homeTeam, awayTeam } as MatchWithTeams;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  /**
   * Update match with automatic propagation to next matches
   * Handles winner/loser propagation and penalty logic
   * Includes time conflict checking with buffer
   */
  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const currentMatch = await this.getMatchById(id);
    if (!currentMatch) return undefined;

    const tournament = await this.getTournamentById(currentMatch.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    // 4) Check time conflicts with buffer (if matchDate or venue is being updated)
    if (updates.matchDate || updates.venue) {
      const matchDate = updates.matchDate ? new Date(updates.matchDate) : (currentMatch.matchDate ? new Date(currentMatch.matchDate) : null);
      const venue = updates.venue ?? currentMatch.venue;
      
      if (matchDate && venue) {
        // Parse schedule config for buffer
        const scheduleConfig = tournament.scheduleConfig 
          ? JSON.parse(tournament.scheduleConfig) 
          : { bufferMinutes: 30 };
        const bufferMinutes = scheduleConfig.bufferMinutes || 30;
        const matchDurationMinutes = (tournament.halfDuration || 45) * 2 + (tournament.breakBetweenHalves || 15);
        
        // Calculate match time range
        const matchStart = new Date(matchDate);
        const matchEnd = new Date(matchDate);
        matchEnd.setMinutes(matchEnd.getMinutes() + matchDurationMinutes + bufferMinutes);
        
        // Check for conflicts with other matches at same venue
        const allMatches = await this.getMatchesByTournament(currentMatch.tournamentId);
        const conflictingMatch = allMatches.find(m => {
          if (m.id === id || !m.matchDate || m.venue !== venue) return false;
          
          const otherStart = new Date(m.matchDate);
          const otherEnd = new Date(m.matchDate);
          otherEnd.setMinutes(otherEnd.getMinutes() + matchDurationMinutes + bufferMinutes);
          
          // Check if time ranges overlap
          return (matchStart < otherEnd && matchEnd > otherStart);
        });
        
        if (conflictingMatch) {
          throw new Error(`تعارض في المواعيد: يوجد مباراة أخرى في نفس الملعب في نفس الوقت`);
        }
      }
    }

    // 2) Handle Penalty Logic for Knockout Matches
    if (currentMatch.stage && ['semi_final', 'quarter_final', 'round_of_16', 'final', 'third_place'].includes(currentMatch.stage)) {
      const homeScore = updates.homeScore ?? currentMatch.homeScore ?? 0;
      const awayScore = updates.awayScore ?? currentMatch.awayScore ?? 0;
      const homePenalty = updates.homePenaltyScore ?? currentMatch.homePenaltyScore;
      const awayPenalty = updates.awayPenaltyScore ?? currentMatch.awayPenaltyScore;
      
      // If scores are equal, require penalties
      if (homeScore === awayScore && homeScore !== null && awayScore !== null) {
        if (homePenalty === null || awayPenalty === null || homePenalty === awayPenalty) {
          // Match cannot be completed without penalty winner
          if (updates.status === 'completed') {
            throw new Error("لا يمكن إنهاء المباراة بدون تحديد الفائز بالترجيح");
          }
        } else {
          // Determine winner from penalties
          const winnerId = homePenalty > awayPenalty ? currentMatch.homeTeamId : currentMatch.awayTeamId;
          const loserId = homePenalty > awayPenalty ? currentMatch.awayTeamId : currentMatch.homeTeamId;
          
          updates.winnerTeamId = winnerId;
          updates.loserTeamId = loserId;
          updates.wentToPenalties = true;
        }
      } else if (homeScore !== null && awayScore !== null) {
        // Regular winner (no penalties needed)
        const winnerId = homeScore > awayScore ? currentMatch.homeTeamId : currentMatch.awayTeamId;
        const loserId = homeScore > awayScore ? currentMatch.awayTeamId : currentMatch.homeTeamId;
        
        updates.winnerTeamId = winnerId;
        updates.loserTeamId = loserId;
        updates.wentToPenalties = false;
      }
      
      // Prevent status = completed without winner
      if (updates.status === 'completed' && !updates.winnerTeamId && !currentMatch.winnerTeamId) {
        throw new Error("لا يمكن إنهاء المباراة بدون تحديد الفائز");
      }
    }

    // Update the match
    const [updatedMatch] = await db
      .update(matches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    
    // 3) Propagation: Update next matches automatically
    if (updatedMatch && updatedMatch.winnerTeamId) {
      await this.propagateMatchResult(id, updatedMatch.winnerTeamId, updatedMatch.loserTeamId);
    }
    
    // If score is updated, recalculate standings (for group/league matches)
    if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
      const fullMatch = await this.getMatchById(id);
      if (fullMatch && (fullMatch.stage === 'group' || fullMatch.stage === 'league')) {
        await this.updateTeamStandings(fullMatch.tournamentId);
      }
    }
    
    return updatedMatch;
  }

  /**
   * Propagate match result to next matches in knockout bracket
   */
  private async propagateMatchResult(matchId: string, winnerId: string | null, loserId: string | null): Promise<void> {
    if (!winnerId) return;

    // Find all matches that reference this match as source
    const allMatches = await db.select().from(matches);
    
    for (const nextMatch of allMatches) {
      let needsUpdate = false;
      const updates: Partial<Match> = {};
      
      // Check home team source
      if (nextMatch.homeTeamSource) {
        const [sourceType, sourceMatchId] = nextMatch.homeTeamSource.split(':');
        if (sourceMatchId === matchId) {
          if (sourceType === 'WINNER_OF' && winnerId) {
            updates.homeTeamId = winnerId;
            needsUpdate = true;
          } else if (sourceType === 'LOSER_OF' && loserId) {
            updates.homeTeamId = loserId;
            needsUpdate = true;
          }
        }
      }
      
      // Check away team source
      if (nextMatch.awayTeamSource) {
        const [sourceType, sourceMatchId] = nextMatch.awayTeamSource.split(':');
        if (sourceMatchId === matchId) {
          if (sourceType === 'WINNER_OF' && winnerId) {
            updates.awayTeamId = winnerId;
            needsUpdate = true;
          } else if (sourceType === 'LOSER_OF' && loserId) {
            updates.awayTeamId = loserId;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await db.update(matches)
          .set(updates)
          .where(eq(matches.id, nextMatch.id));
      }
    }
  }

  async deleteMatch(id: string): Promise<boolean> {
    await db.delete(matches).where(eq(matches.id, id));
    return true;
  }

  async generateLeagueMatches(tournamentId: string, options?: { 
    matchesPerDay?: number;
    dailyStartTime?: string; 
  }): Promise<Match[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    if (tournamentTeams.length < 2) throw new Error("Not enough teams");

    // Delete existing matches
    await db.delete(matches).where(eq(matches.tournamentId, tournamentId));

    // Parse schedule config from tournament or options
    let scheduleConfig: Record<string, any> = { matchesPerDay: 2, dailyStartTime: "16:00" };
    if (tournament.scheduleConfig) {
      try {
        const parsed = JSON.parse(tournament.scheduleConfig);
        // Merge all fields first, then normalize field names
        scheduleConfig = { ...scheduleConfig, ...parsed };
        // Support both matchesPerDay and matchesPerDayPerVenue (legacy compatibility)
        if (parsed.matchesPerDayPerVenue && !parsed.matchesPerDay) {
          scheduleConfig.matchesPerDay = parsed.matchesPerDayPerVenue;
        }
      } catch (e) {}
    }
    if (options?.matchesPerDay) scheduleConfig.matchesPerDay = options.matchesPerDay;
    if (options?.dailyStartTime) scheduleConfig.dailyStartTime = options.dailyStartTime;

    const generatedMatches: Match[] = [];
    const teamsList = [...tournamentTeams];

    // Add ghost team if odd number
    if (teamsList.length % 2 !== 0) {
      teamsList.push({ id: 'ghost', name: 'BYE' } as Team);
    }

    const numTeams = teamsList.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    // Calculate dates using tournament start/end dates
    const startDate = tournament.startDate ? new Date(tournament.startDate) : new Date();
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    // Generate all match pairs first
    const allMatchPairs: { homeTeam: typeof teamsList[0]; awayTeam: typeof teamsList[0]; round: number; leg: number }[] = [];

    // Round-robin algorithm
    for (let round = 0; round < numRounds; round++) {
      for (let matchNum = 0; matchNum < matchesPerRound; matchNum++) {
        const home = (round + matchNum) % (numTeams - 1);
        let away = (numTeams - 1 - matchNum + round) % (numTeams - 1);
        
        if (matchNum === 0) {
          away = numTeams - 1;
        }

        const homeTeam = teamsList[home];
        const awayTeam = teamsList[away];

        // Skip ghost matches
        if (homeTeam.id === 'ghost' || awayTeam.id === 'ghost') continue;

        allMatchPairs.push({ homeTeam, awayTeam, round: round + 1, leg: 1 });

        // Second leg (إياب) if enabled
        if (tournament.hasSecondLeg) {
          allMatchPairs.push({ 
            homeTeam: awayTeam, 
            awayTeam: homeTeam, 
            round: numRounds + round + 1, 
            leg: 2 
          });
        }
      }
    }

    // Distribute matches across dates with venue-based time slots
    const { matchesPerDay, dailyStartTime } = scheduleConfig;
    const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
    
    // Calculate match duration from tournament settings
    const halfDuration = tournament.halfDuration || 45;
    const breakBetweenHalves = tournament.breakBetweenHalves || 15;
    const matchDurationMinutes = (halfDuration * 2) + breakBetweenHalves + 15; // Add 15 min buffer
    
    // Get venues configuration
    const venuesList = tournament.venues && tournament.venues.length > 0 
      ? tournament.venues 
      : ['الملعب الرئيسي'];
    const numberOfVenues = venuesList.length;
    
    // Get per-venue match configs (if specified)
    const venueMatchConfigs: Record<string, number> = scheduleConfig.venueMatchConfigs || {};
    
    // Helper to get matches per venue
    const getMatchesPerVenue = (venue: string): number => {
      return venueMatchConfigs[venue] || matchesPerDay;
    };
    
    let currentDate = new Date(startDate);
    let matchesScheduledToday = 0;
    let currentVenueIndex = 0;
    
    // Track matches per venue per day
    const venueMatchesToday: Record<string, number> = {};
    for (const venue of venuesList) {
      venueMatchesToday[venue] = 0;
    }

    for (const matchPair of allMatchPairs) {
      // Find a venue that hasn't reached its daily limit
      let selectedVenueIndex = currentVenueIndex;
      let foundVenue = false;
      
      for (let i = 0; i < numberOfVenues; i++) {
        const venueIdx = (currentVenueIndex + i) % numberOfVenues;
        const venue = venuesList[venueIdx];
        const venueLimit = getMatchesPerVenue(venue);
        
        if (venueMatchesToday[venue] < venueLimit) {
          selectedVenueIndex = venueIdx;
          foundVenue = true;
          break;
        }
      }
      
      // If no venue available, move to next day
      if (!foundVenue) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        for (const venue of venuesList) {
          venueMatchesToday[venue] = 0;
        }
        selectedVenueIndex = 0;
        
        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          currentDate = new Date(startDate);
        }
      }
      
      const selectedVenue = venuesList[selectedVenueIndex];
      const timeSlotForVenue = venueMatchesToday[selectedVenue];
      
      // Calculate match time based on venue and time slot
      const totalMinutesOffset = timeSlotForVenue * matchDurationMinutes;
      const slotHour = startHour + Math.floor(totalMinutesOffset / 60);
      const slotMinute = startMinute + (totalMinutesOffset % 60);
      // Use Muscat timezone (UTC+4) to preserve wall-clock time
      const dateStr = getMuscatDateString(currentDate);
      const matchDate = createMuscatDate(dateStr, slotHour, slotMinute);

      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: matchPair.homeTeam.id,
        awayTeamId: matchPair.awayTeam.id,
        round: matchPair.round,
        leg: matchPair.leg,
        stage: tournament.hasGroupStage ? 'group' : 'league',
        groupNumber: matchPair.homeTeam.groupNumber,
        matchDate,
        venue: selectedVenue,
        status: 'scheduled',
      }).returning();
      generatedMatches.push(match);

      matchesScheduledToday++;
      venueMatchesToday[selectedVenue]++;
      
      // Move to next venue
      currentVenueIndex = (selectedVenueIndex + 1) % numberOfVenues;
      
      // Calculate total daily capacity
      const totalDailyCapacity = venuesList.reduce((sum, v) => sum + getMatchesPerVenue(v), 0);

      // Move to next day if all venues are full
      if (matchesScheduledToday >= totalDailyCapacity) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        for (const venue of venuesList) {
          venueMatchesToday[venue] = 0;
        }

        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          currentDate = new Date(startDate);
        }
      }
    }

    return generatedMatches;
  }

  /**
   * Advanced Seeding Engine for Knockout Bracket Generation
   * Supports any number of groups with intelligent seeding and propagation
   */
  async generateKnockoutMatchesFromGroups(tournamentId: string): Promise<Match[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (!tournament.hasGroupStage) throw new Error("Tournament doesn't have group stage");

    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    
    // A) Determine Qualified Teams
    const groupedTeams: Record<number, Team[]> = {};
    for (const team of tournamentTeams) {
      const groupNum = team.groupNumber || 0;
      if (groupNum > 0) {
        if (!groupedTeams[groupNum]) groupedTeams[groupNum] = [];
        groupedTeams[groupNum].push(team);
      }
    }

    // Sort each group by points, goal difference, goals for
    for (const groupNum in groupedTeams) {
      groupedTeams[groupNum].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
    }

    const teamsAdvancingPerGroup = tournament.teamsAdvancingPerGroup || 2;
    const qualifiedTeams: { team: Team; position: number; groupNumber: number; seed: number }[] = [];
    const groups = Object.keys(groupedTeams).map(Number).sort((a, b) => a - b);
    
    // Collect all group winners first, then runners-up
    const groupWinners: { team: Team; position: number; groupNumber: number }[] = [];
    const groupRunnersUp: { team: Team; position: number; groupNumber: number }[] = [];
    
    for (const groupNum of groups) {
      const groupTeams = groupedTeams[groupNum];
      for (let pos = 1; pos <= Math.min(teamsAdvancingPerGroup, groupTeams.length); pos++) {
        const qualifier = { team: groupTeams[pos - 1], position: pos, groupNumber: groupNum };
        if (pos === 1) {
          groupWinners.push(qualifier);
        } else {
          groupRunnersUp.push(qualifier);
        }
      }
    }

    // Sort winners and runners-up by overall performance
    const sortQualifiers = (a: typeof groupWinners[0], b: typeof groupWinners[0]) => {
      if (b.team.points !== a.team.points) return b.team.points - a.team.points;
      if (b.team.goalDifference !== a.team.goalDifference) return b.team.goalDifference - a.team.goalDifference;
      return b.team.goalsFor - a.team.goalsFor;
    };
    
    groupWinners.sort(sortQualifiers);
    groupRunnersUp.sort(sortQualifiers);

    // Assign seeds: Seeds 1..G = Winners, Seeds G+1..2G = Runners-up
    let seedNumber = 1;
    for (const winner of groupWinners) {
      qualifiedTeams.push({ ...winner, seed: seedNumber++ });
    }
    for (const runnerUp of groupRunnersUp) {
      qualifiedTeams.push({ ...runnerUp, seed: seedNumber++ });
    }

    const Q = qualifiedTeams.length; // Number of qualified teams
    if (Q < 2) {
      throw new Error("Not enough qualified teams for knockout stage");
    }

    // B) Determine Bracket Size (next power of 2)
    const getNextPowerOf2 = (n: number): number => {
      if (n <= 2) return 2;
      return Math.pow(2, Math.ceil(Math.log2(n)));
    };
    
    const B = getNextPowerOf2(Q); // Bracket size
    const byes = B - Q; // Number of byes

    // C) Delete existing knockout matches
    await db.delete(matches)
      .where(
        and(
          eq(matches.tournamentId, tournamentId),
          sql`${matches.stage} != 'group' AND ${matches.stage} != 'league'`
        )
      );

    // D) Generate First Round Matchups with Seeding
    // Standard seeding: Seed 1 vs Seed B, Seed 2 vs Seed B-1, etc.
    const firstRoundMatches: Array<{
      homeSeed: number | null;
      awaySeed: number | null;
      homeTeamId: string | null;
      awayTeamId: string | null;
      homeTeamSource: string | null;
      awayTeamSource: string | null;
      bracketPosition: number;
    }> = [];

    // Top seeds get byes (skip first round)
    const teamsWithByes = Math.min(byes, qualifiedTeams.length);
    const teamsInFirstRound = Q - teamsWithByes;
    
    // Create first round matchups
    for (let i = 0; i < teamsInFirstRound / 2; i++) {
      const homeSeed = teamsWithByes + i + 1;
      const awaySeed = B - i;
      
      const homeQualifier = qualifiedTeams.find(q => q.seed === homeSeed);
      const awayQualifier = qualifiedTeams.find(q => q.seed === awaySeed);
      
      // Avoid same-group matchups (greedy swap)
      if (homeQualifier && awayQualifier && homeQualifier.groupNumber === awayQualifier.groupNumber) {
        // Swap with next available seed
        const swapCandidate = qualifiedTeams.find(q => 
          q.seed !== homeSeed && 
          q.seed !== awaySeed && 
          q.groupNumber !== homeQualifier.groupNumber &&
          !firstRoundMatches.some(m => m.homeSeed === q.seed || m.awaySeed === q.seed)
        );
        if (swapCandidate) {
          const temp = awaySeed;
          // Use swapCandidate instead
          const newAwayQualifier = swapCandidate;
          firstRoundMatches.push({
            homeSeed: homeQualifier.seed,
            awaySeed: newAwayQualifier.seed,
            homeTeamId: homeQualifier.team.id,
            awayTeamId: newAwayQualifier.team.id,
            homeTeamSource: `SEED:${homeQualifier.seed}`,
            awayTeamSource: `SEED:${newAwayQualifier.seed}`,
            bracketPosition: i + 1,
          });
          continue;
        }
      }
      
      firstRoundMatches.push({
        homeSeed: homeQualifier?.seed || null,
        awaySeed: awayQualifier?.seed || null,
        homeTeamId: homeQualifier?.team.id || null,
        awayTeamId: awayQualifier?.team.id || null,
        homeTeamSource: homeQualifier ? `SEED:${homeQualifier.seed}` : null,
        awayTeamSource: awayQualifier ? `SEED:${awayQualifier.seed}` : null,
        bracketPosition: i + 1,
      });
    }

    // Determine stages based on bracket size
    const stageDefinitions: Array<{ stage: string; matchCount: number; round: number }> = [];
    if (B >= 16) {
      stageDefinitions.push({ stage: 'round_of_16', matchCount: 8, round: 1 });
      stageDefinitions.push({ stage: 'quarter_final', matchCount: 4, round: 2 });
      stageDefinitions.push({ stage: 'semi_final', matchCount: 2, round: 3 });
    } else if (B >= 8) {
      stageDefinitions.push({ stage: 'quarter_final', matchCount: 4, round: 1 });
      stageDefinitions.push({ stage: 'semi_final', matchCount: 2, round: 2 });
    } else if (B >= 4) {
      stageDefinitions.push({ stage: 'semi_final', matchCount: 2, round: 1 });
    }

    // E) Generate all knockout matches with propagation
    const generatedMatches: Match[] = [];
    const matchMap: Map<string, Match> = new Map(); // For propagation references
    
    // Parse schedule config for buffer
    const scheduleConfig = tournament.scheduleConfig 
      ? JSON.parse(tournament.scheduleConfig) 
      : { dailyStartTime: "16:00", matchesPerDayPerVenue: 3 };
    const bufferMinutes = scheduleConfig.bufferMinutes || 30;
    const matchDurationMinutes = (tournament.halfDuration || 45) * 2 + (tournament.breakBetweenHalves || 15);
    
    // Calculate base date (start from group stage end or now + 7 days)
    const baseDate = tournament.endDate ? new Date(tournament.endDate) : new Date();
    if (!tournament.endDate) {
      baseDate.setDate(baseDate.getDate() + 7);
    }
    baseDate.setHours(parseInt(scheduleConfig.dailyStartTime?.split(':')[0] || '16'), parseInt(scheduleConfig.dailyStartTime?.split(':')[1] || '0'), 0, 0);

    // Create first round matches
    let currentDate = new Date(baseDate);
    let matchIndex = 0;
    
    for (const firstRoundMatch of firstRoundMatches) {
      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: firstRoundMatch.homeTeamId,
        awayTeamId: firstRoundMatch.awayTeamId,
        homeTeamSource: firstRoundMatch.homeTeamSource,
        awayTeamSource: firstRoundMatch.awayTeamSource,
        round: 1,
        leg: 1,
        stage: stageDefinitions[0]?.stage || 'semi_final',
        bracketPosition: firstRoundMatch.bracketPosition,
        matchDate: new Date(currentDate),
        venue: tournament.venues && tournament.venues.length > 0 
          ? tournament.venues[matchIndex % tournament.venues.length] 
          : null,
        status: 'scheduled',
      }).returning();
      
      generatedMatches.push(match);
      matchMap.set(`round_1_match_${firstRoundMatch.bracketPosition}`, match);
      
      // Increment time for next match (considering buffer)
      currentDate.setMinutes(currentDate.getMinutes() + matchDurationMinutes + bufferMinutes);
      matchIndex++;
    }

    // Create subsequent rounds with propagation
    for (let roundIndex = 1; roundIndex < stageDefinitions.length; roundIndex++) {
      const prevRound = stageDefinitions[roundIndex - 1];
      const currentRound = stageDefinitions[roundIndex];
      const prevMatchCount = prevRound.matchCount;
      
      for (let matchNum = 1; matchNum <= currentRound.matchCount; matchNum++) {
        const prevMatch1Pos = (matchNum - 1) * 2 + 1;
        const prevMatch2Pos = (matchNum - 1) * 2 + 2;
        
        const prevMatch1 = matchMap.get(`round_${prevRound.round}_match_${prevMatch1Pos}`);
        const prevMatch2 = matchMap.get(`round_${prevRound.round}_match_${prevMatch2Pos}`);
        
        // Calculate match date (after previous round + buffer)
        const matchDate = new Date(currentDate);
        matchDate.setDate(matchDate.getDate() + (roundIndex * 2)); // 2 days between rounds
        
        const [match] = await db.insert(matches).values({
          tournamentId,
          homeTeamId: null,
          awayTeamId: null,
          homeTeamSource: prevMatch1 ? `WINNER_OF:${prevMatch1.id}` : null,
          awayTeamSource: prevMatch2 ? `WINNER_OF:${prevMatch2.id}` : null,
          round: currentRound.round,
          leg: 1,
          stage: currentRound.stage,
          bracketPosition: matchNum,
          matchDate,
          venue: tournament.venues && tournament.venues.length > 0 
            ? tournament.venues[0] 
            : null,
          status: 'scheduled',
        }).returning();
        
        generatedMatches.push(match);
        matchMap.set(`round_${currentRound.round}_match_${matchNum}`, match);
      }
    }

    // F) Create Final and Third Place matches
    const lastRound = stageDefinitions[stageDefinitions.length - 1];
    const semiFinal1 = matchMap.get(`round_${lastRound.round}_match_1`);
    const semiFinal2 = matchMap.get(`round_${lastRound.round}_match_2`);
    
    if (semiFinal1 && semiFinal2) {
      const finalDate = new Date(baseDate);
      finalDate.setDate(finalDate.getDate() + (stageDefinitions.length * 2) + 2);
      
      // Final match
      const [finalMatch] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamSource: `WINNER_OF:${semiFinal1.id}`,
        awayTeamSource: `WINNER_OF:${semiFinal2.id}`,
        round: 1,
        leg: 1,
        stage: 'final',
        bracketPosition: 1,
        matchDate: finalDate,
        venue: tournament.venues && tournament.venues.length > 0 
          ? tournament.venues[0] 
          : null,
        status: 'scheduled',
      }).returning();
      
      generatedMatches.push(finalMatch);
      
      // Third Place match (if enabled)
      if (tournament.hasThirdPlaceMatch) {
        const thirdPlaceDate = new Date(finalDate);
        thirdPlaceDate.setHours(thirdPlaceDate.getHours() - 2);
        
        const [thirdPlaceMatch] = await db.insert(matches).values({
          tournamentId,
          homeTeamId: null,
          awayTeamId: null,
          homeTeamSource: `LOSER_OF:${semiFinal1.id}`,
          awayTeamSource: `LOSER_OF:${semiFinal2.id}`,
          round: 1,
          leg: 1,
          stage: 'third_place',
          bracketPosition: 1,
          matchDate: thirdPlaceDate,
          venue: tournament.venues && tournament.venues.length > 0 
            ? tournament.venues[0] 
            : null,
          status: 'scheduled',
        }).returning();
        
        generatedMatches.push(thirdPlaceMatch);
      }
    }

    return generatedMatches;
  }

  // ========== GROUP STAGE MANAGEMENT ==========
  
  async assignTeamsToGroups(tournamentId: string, assignments?: { teamId: string; groupNumber: number }[]): Promise<Team[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    
    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    if (tournamentTeams.length === 0) throw new Error("No teams in tournament");
    
    const numberOfGroups = tournament.numberOfGroups || 2;
    
    if (assignments && assignments.length > 0) {
      // Manual assignment
      for (const assignment of assignments) {
        await db.update(teams)
          .set({ groupNumber: assignment.groupNumber })
          .where(eq(teams.id, assignment.teamId));
      }
    } else {
      // Auto-distribute teams evenly across groups
      const shuffled = [...tournamentTeams].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        const groupNumber = (i % numberOfGroups) + 1;
        await db.update(teams)
          .set({ groupNumber })
          .where(eq(teams.id, shuffled[i].id));
      }
    }
    
    // Update tournament stage
    await db.update(tournaments)
      .set({ currentStage: 'group_stage' })
      .where(eq(tournaments.id, tournamentId));
    
    return await this.getTeamsByTournament(tournamentId);
  }
  
  async getGroupStandings(tournamentId: string): Promise<{ groupNumber: number; teams: Team[] }[]> {
    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    
    // Group teams by groupNumber
    const groupedTeams: Record<number, Team[]> = {};
    for (const team of tournamentTeams) {
      const groupNum = team.groupNumber || 0;
      if (groupNum > 0) {
        if (!groupedTeams[groupNum]) groupedTeams[groupNum] = [];
        groupedTeams[groupNum].push(team);
      }
    }
    
    // Sort each group by points, goal difference, goals for
    const result: { groupNumber: number; teams: Team[] }[] = [];
    const groups = Object.keys(groupedTeams).map(Number).sort((a, b) => a - b);
    
    for (const groupNum of groups) {
      const sortedTeams = groupedTeams[groupNum].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      result.push({ groupNumber: groupNum, teams: sortedTeams });
    }
    
    return result;
  }
  
  async generateGroupStageMatches(tournamentId: string, options?: { matchesPerDay?: number; dailyStartTime?: string }): Promise<Match[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    // Check if tournament has group stage (either by flag or type)
    const isGroupTournament = tournament.hasGroupStage || tournament.type === 'groups' || tournament.type === 'groups_knockout';
    if (!isGroupTournament) throw new Error("Tournament doesn't have group stage");
    
    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    
    // Group teams by groupNumber
    const groupedTeams: Record<number, Team[]> = {};
    for (const team of tournamentTeams) {
      const groupNum = team.groupNumber || 0;
      if (groupNum > 0) {
        if (!groupedTeams[groupNum]) groupedTeams[groupNum] = [];
        groupedTeams[groupNum].push(team);
      }
    }
    
    // Delete existing group stage matches
    await db.delete(matches)
      .where(
        and(
          eq(matches.tournamentId, tournamentId),
          eq(matches.stage, 'group')
        )
      );
    
    const generatedMatches: Match[] = [];
    // Respect the hasSecondLeg setting from tournament for group stage
    const hasSecondLeg = tournament.hasSecondLeg ?? false;
    
    // Parse schedule config from tournament or options (same as generateLeagueMatches)
    let scheduleConfig: Record<string, any> = { matchesPerDay: 4, dailyStartTime: "16:00" };
    if (tournament.scheduleConfig) {
      try {
        const parsed = JSON.parse(tournament.scheduleConfig);
        // Merge all fields first, then normalize field names
        scheduleConfig = { ...scheduleConfig, ...parsed };
        // Support both matchesPerDay and matchesPerDayPerVenue (legacy compatibility)
        if (parsed.matchesPerDayPerVenue && !parsed.matchesPerDay) {
          scheduleConfig.matchesPerDay = parsed.matchesPerDayPerVenue;
        }
      } catch (e) {}
    }
    if (options?.matchesPerDay) scheduleConfig.matchesPerDay = options.matchesPerDay;
    if (options?.dailyStartTime) scheduleConfig.dailyStartTime = options.dailyStartTime;
    
    const matchesPerDay = scheduleConfig.matchesPerDay;
    const dailyStartTime = scheduleConfig.dailyStartTime;
    
    // Parse start time
    const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
    
    // Calculate match duration from tournament settings
    const halfDuration = tournament.halfDuration || 45;
    const breakBetweenHalves = tournament.breakBetweenHalves || 15;
    const matchDurationMinutes = (halfDuration * 2) + breakBetweenHalves + 15; // Add 15 min buffer
    
    // Get venues configuration
    const venuesList = tournament.venues && tournament.venues.length > 0 
      ? tournament.venues 
      : ['الملعب الرئيسي'];
    const numberOfVenues = venuesList.length;
    
    // Get per-venue match configs (if specified)
    const venueMatchConfigs: Record<string, number> = scheduleConfig.venueMatchConfigs || {};
    
    // Calculate total matches per day based on per-venue configs
    const getMatchesPerVenue = (venue: string): number => {
      return venueMatchConfigs[venue] || matchesPerDay;
    };
    
    // Schedule settings
    let startDate = tournament.startDate ? new Date(tournament.startDate) : new Date();
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
    let currentDate = new Date(startDate);
    let matchesScheduledToday = 0;
    let currentVenueIndex = 0;
    let currentTimeSlotInVenue = 0;
    
    // Track matches per venue per day
    const venueMatchesToday: Record<string, number> = {};
    for (const venue of venuesList) {
      venueMatchesToday[venue] = 0;
    }
    
    // Generate round-robin matches for each group using proper round-robin scheduling
    // For n teams: n-1 rounds, each round has n/2 matches (n must be even, add dummy if odd)
    const allMatchPairs: { home: Team; away: Team; round: number; leg: number; groupNum: number }[] = [];
    const groups = Object.keys(groupedTeams).map(Number).sort((a, b) => a - b);
    
    for (const groupNum of groups) {
      const groupTeams = [...groupedTeams[groupNum]];
      if (groupTeams.length < 2) continue;
      
      // Round-robin algorithm - generates proper rounds where each team plays once per round
      // For 4 teams: 3 rounds with 2 matches each = 6 total matches
      const n = groupTeams.length;
      const numRounds = n - 1; // For n teams, we need n-1 rounds
      
      // If odd number of teams, add a "bye" placeholder
      const teamsForScheduling = [...groupTeams];
      if (n % 2 !== 0) {
        teamsForScheduling.push(null as any); // Bye team
      }
      
      const scheduleSize = teamsForScheduling.length;
      const halfSize = scheduleSize / 2;
      
      // Generate each round
      for (let round = 1; round <= numRounds; round++) {
        // Create pairings for this round
        const homeTeamsThisRound = teamsForScheduling.slice(0, halfSize);
        const awayTeamsThisRound = teamsForScheduling.slice(halfSize).reverse();
        
        for (let i = 0; i < halfSize; i++) {
          const home = homeTeamsThisRound[i];
          const away = awayTeamsThisRound[i];
          
          // Skip if either is a bye (null)
          if (home && away) {
            allMatchPairs.push({ 
              home, 
              away, 
              round, 
              leg: 1,
              groupNum 
            });
            
            if (hasSecondLeg) {
              allMatchPairs.push({ 
                home: away, 
                away: home, 
                round: round + numRounds, 
                leg: 2,
                groupNum 
              });
            }
          }
        }
        
        // Rotate teams for next round (keep first team fixed)
        const fixed = teamsForScheduling[0];
        const toRotate = teamsForScheduling.slice(1);
        const last = toRotate.pop()!;
        toRotate.unshift(last);
        teamsForScheduling.splice(0, scheduleSize, fixed, ...toRotate);
      }
    }
    
    // Sort matches by round first (so all round 1 matches are scheduled together, then round 2, etc.)
    allMatchPairs.sort((a, b) => a.round - b.round);
    
    // Create matches with venue-based time slots respecting per-venue limits
    for (const matchPair of allMatchPairs) {
      // Find a venue that hasn't reached its daily limit
      let selectedVenueIndex = currentVenueIndex;
      let foundVenue = false;
      
      for (let i = 0; i < numberOfVenues; i++) {
        const venueIdx = (currentVenueIndex + i) % numberOfVenues;
        const venue = venuesList[venueIdx];
        const venueLimit = getMatchesPerVenue(venue);
        
        if (venueMatchesToday[venue] < venueLimit) {
          selectedVenueIndex = venueIdx;
          foundVenue = true;
          break;
        }
      }
      
      // If no venue available, move to next day
      if (!foundVenue) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        currentTimeSlotInVenue = 0;
        for (const venue of venuesList) {
          venueMatchesToday[venue] = 0;
        }
        selectedVenueIndex = 0;
        
        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          currentDate = new Date(startDate);
        }
      }
      
      const selectedVenue = venuesList[selectedVenueIndex];
      const timeSlotForVenue = venueMatchesToday[selectedVenue];
      
      // Calculate match time based on venue and time slot
      const totalMinutesOffset = timeSlotForVenue * matchDurationMinutes;
      const slotHour = startHour + Math.floor(totalMinutesOffset / 60);
      const slotMinute = startMinute + (totalMinutesOffset % 60);
      // Use Muscat timezone (UTC+4) to preserve wall-clock time
      const dateStr = getMuscatDateString(currentDate);
      const matchDate = createMuscatDate(dateStr, slotHour, slotMinute);
      
      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: matchPair.home.id,
        awayTeamId: matchPair.away.id,
        round: matchPair.round,
        leg: matchPair.leg,
        stage: 'group',
        groupNumber: matchPair.groupNum,
        matchDate,
        venue: selectedVenue,
        status: 'scheduled',
      }).returning();
      
      generatedMatches.push(match);
      matchesScheduledToday++;
      venueMatchesToday[selectedVenue]++;
      
      // Move to next venue
      currentVenueIndex = (selectedVenueIndex + 1) % numberOfVenues;
      
      // Calculate total daily capacity
      const totalDailyCapacity = venuesList.reduce((sum, v) => sum + getMatchesPerVenue(v), 0);
      
      // Move to next day if all venues are full
      if (matchesScheduledToday >= totalDailyCapacity) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        currentTimeSlotInVenue = 0;
        for (const venue of venuesList) {
          venueMatchesToday[venue] = 0;
        }
        
        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          currentDate = new Date(startDate);
        }
      }
    }
    
    // For groups_knockout tournaments, generate empty knockout stage matches
    // This allows the knockout bracket to display with placeholder labels (like أ1, ب2)
    if (tournament.type === 'groups_knockout') {
      // Delete existing knockout matches first
      await db.delete(matches)
        .where(
          and(
            eq(matches.tournamentId, tournamentId),
            sql`${matches.stage} IN ('semi_final', 'final', 'third_place', 'quarter_final', 'round_of_16')`
          )
        );
      
      const numGroups = tournament.numberOfGroups || 2;
      const teamsAdvancing = tournament.teamsAdvancingPerGroup || 2;
      const qualifyingTeams = numGroups * teamsAdvancing;
      
      // Dynamically determine knockout structure
      // Find the next power of 2 that can accommodate all qualifying teams
      // e.g., 6 teams → 8 bracket, 5 teams → 8 bracket, 3 teams → 4 bracket
      const getNextPowerOf2 = (n: number): number => {
        if (n <= 2) return 2;
        return Math.pow(2, Math.ceil(Math.log2(n)));
      };
      
      const bracketSize = getNextPowerOf2(qualifyingTeams);
      const knockoutMatchesToCreate: { stage: string; round: number }[] = [];
      
      // Define knockout stages based on bracket size
      const stageDefinitions: { minBracket: number; stage: string; matchCount: number }[] = [
        { minBracket: 16, stage: 'round_of_16', matchCount: 8 },
        { minBracket: 8, stage: 'quarter_final', matchCount: 4 },
        { minBracket: 4, stage: 'semi_final', matchCount: 2 },
      ];
      
      // Generate matches for each applicable stage
      for (const def of stageDefinitions) {
        if (bracketSize >= def.minBracket) {
          for (let i = 1; i <= def.matchCount; i++) {
            knockoutMatchesToCreate.push({ stage: def.stage, round: i });
          }
        }
      }
      
      // Always add final for brackets of 4 or more
      if (bracketSize >= 4) {
        knockoutMatchesToCreate.push({ stage: 'final', round: 1 });
        
        // Third place match (if enabled)
        if (tournament.hasThirdPlaceMatch !== false) {
          knockoutMatchesToCreate.push({ stage: 'third_place', round: 1 });
        }
      } else if (bracketSize === 2) {
        // Just a final for 2 teams
        knockoutMatchesToCreate.push({ stage: 'final', round: 1 });
      }
      
      // Calculate knockout match dates
      const lastGroupMatch = generatedMatches
        .filter(m => m.stage === 'group')
        .sort((a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime())[0];
      
      const lastGroupDate = lastGroupMatch?.matchDate 
        ? new Date(lastGroupMatch.matchDate) 
        : new Date(startDate);
      
      // Semi-finals: day after last group match
      // Use getMuscatDateString to get the date in Muscat timezone, then add 1 day
      const lastGroupDateStr = getMuscatDateString(lastGroupDate);
      const semiFinalDateStr = addDaysToDateString(lastGroupDateStr, 1);
      const semiFinalDate = createMuscatDate(semiFinalDateStr, startHour, startMinute);
      
      // Final and third place: tournament end date or 4 days after semi-final
      let finalDateStr: string;
      let finalHour = startHour;
      let finalMinute = startMinute;
      if (tournament.endDate) {
        // Preserve both date and time from tournament.endDate
        const endDateComponents = getMuscatDateComponents(new Date(tournament.endDate));
        finalDateStr = `${endDateComponents.year}-${String(endDateComponents.month).padStart(2, '0')}-${String(endDateComponents.day).padStart(2, '0')}`;
        finalHour = endDateComponents.hour;
        finalMinute = endDateComponents.minute;
      } else {
        finalDateStr = addDaysToDateString(semiFinalDateStr, 4);
      }
      const finalDate = createMuscatDate(finalDateStr, finalHour, finalMinute);
      
      const thirdPlaceDate = new Date(finalDate);
      
      // Create knockout matches with null team IDs but with dates
      for (const knockoutMatch of knockoutMatchesToCreate) {
        let matchDate: Date;
        let venue = venuesList[0];
        
        if (knockoutMatch.stage === 'round_of_16') {
          // Round of 16: 3 days before semi-finals
          const ro16DateStr = addDaysToDateString(semiFinalDateStr, -3);
          const extraMinutes = (knockoutMatch.round - 1) * matchDurationMinutes;
          const totalMinutes = startMinute + extraMinutes;
          const adjustedHour = startHour + Math.floor(totalMinutes / 60);
          const adjustedMinute = totalMinutes % 60;
          matchDate = createMuscatDate(ro16DateStr, adjustedHour, adjustedMinute);
        } else if (knockoutMatch.stage === 'quarter_final') {
          // Quarter finals: day before semi-finals
          const qfDateStr = addDaysToDateString(semiFinalDateStr, -1);
          const extraMinutes = (knockoutMatch.round - 1) * matchDurationMinutes;
          const totalMinutes = startMinute + extraMinutes;
          const adjustedHour = startHour + Math.floor(totalMinutes / 60);
          const adjustedMinute = totalMinutes % 60;
          matchDate = createMuscatDate(qfDateStr, adjustedHour, adjustedMinute);
        } else if (knockoutMatch.stage === 'semi_final') {
          const extraMinutes = (knockoutMatch.round - 1) * matchDurationMinutes;
          const totalMinutes = startMinute + extraMinutes;
          const adjustedHour = startHour + Math.floor(totalMinutes / 60);
          const adjustedMinute = totalMinutes % 60;
          matchDate = createMuscatDate(semiFinalDateStr, adjustedHour, adjustedMinute);
        } else if (knockoutMatch.stage === 'third_place') {
          matchDate = new Date(thirdPlaceDate);
        } else {
          // Final: after third place match if it exists, otherwise at start time
          if (tournament.hasThirdPlaceMatch !== false) {
            const extraMinutes = matchDurationMinutes;
            const totalMinutes = finalMinute + extraMinutes;
            const adjustedHour = finalHour + Math.floor(totalMinutes / 60);
            const adjustedMinute = totalMinutes % 60;
            matchDate = createMuscatDate(finalDateStr, adjustedHour, adjustedMinute);
          } else {
            matchDate = new Date(finalDate);
          }
        }
        
        const [match] = await db.insert(matches).values({
          tournamentId,
          homeTeamId: null,
          awayTeamId: null,
          round: knockoutMatch.round,
          stage: knockoutMatch.stage,
          status: 'scheduled',
          matchDate,
          venue,
        }).returning();
        
        generatedMatches.push(match);
      }
    }
    
    return generatedMatches;
  }
  
  async completeGroupStage(tournamentId: string): Promise<{ tournament: Tournament; qualifiedTeams: Team[] }> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (!tournament.hasGroupStage) throw new Error("Tournament doesn't have group stage");
    
    // Get group standings
    const standings = await this.getGroupStandings(tournamentId);
    const teamsAdvancing = tournament.teamsAdvancingPerGroup || 2;
    
    // Get qualified teams from each group
    const qualifiedTeams: Team[] = [];
    for (const group of standings) {
      const advancing = group.teams.slice(0, teamsAdvancing);
      qualifiedTeams.push(...advancing);
    }
    
    // Update tournament to mark group stage as complete
    const [updatedTournament] = await db.update(tournaments)
      .set({ 
        groupStageComplete: true,
        currentStage: 'knockout_stage'
      })
      .where(eq(tournaments.id, tournamentId))
      .returning();
    
    return { tournament: updatedTournament, qualifiedTeams };
  }

  // Match Events
  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    return await db
      .select()
      .from(matchEvents)
      .where(eq(matchEvents.matchId, matchId))
      .orderBy(asc(matchEvents.minute));
  }

  async createMatchEvent(insertEvent: InsertMatchEvent): Promise<MatchEvent> {
    const [event] = await db.insert(matchEvents).values(insertEvent).returning();
    
    // Update player stats if it's a goal or card
    if (insertEvent.playerId) {
      if (insertEvent.eventType === 'goal') {
        await db.update(players)
          .set({ goals: sql`${players.goals} + 1` })
          .where(eq(players.id, insertEvent.playerId));
      } else if (insertEvent.eventType === 'assist') {
        await db.update(players)
          .set({ assists: sql`${players.assists} + 1` })
          .where(eq(players.id, insertEvent.playerId));
      } else if (insertEvent.eventType === 'yellow_card') {
        await db.update(players)
          .set({ yellowCards: sql`${players.yellowCards} + 1` })
          .where(eq(players.id, insertEvent.playerId));
      } else if (insertEvent.eventType === 'red_card') {
        await db.update(players)
          .set({ redCards: sql`${players.redCards} + 1` })
          .where(eq(players.id, insertEvent.playerId));
      }
    }

    return event;
  }

  async deleteMatchEvent(id: string): Promise<boolean> {
    // Get the event before deleting to update player stats
    const [event] = await db.select().from(matchEvents).where(eq(matchEvents.id, id));
    
    if (event && event.playerId) {
      // Decrement player stats if it's a goal or card
      if (event.eventType === 'goal') {
        await db.update(players)
          .set({ goals: sql`GREATEST(${players.goals} - 1, 0)` })
          .where(eq(players.id, event.playerId));
      } else if (event.eventType === 'assist') {
        await db.update(players)
          .set({ assists: sql`GREATEST(${players.assists} - 1, 0)` })
          .where(eq(players.id, event.playerId));
      } else if (event.eventType === 'yellow_card') {
        await db.update(players)
          .set({ yellowCards: sql`GREATEST(${players.yellowCards} - 1, 0)` })
          .where(eq(players.id, event.playerId));
      } else if (event.eventType === 'red_card') {
        await db.update(players)
          .set({ redCards: sql`GREATEST(${players.redCards} - 1, 0)` })
          .where(eq(players.id, event.playerId));
      }
    }
    
    await db.delete(matchEvents).where(eq(matchEvents.id, id));
    return true;
  }

  // Recalculate player stats from match events (to fix any discrepancies)
  async recalculatePlayerStats(tournamentId?: string): Promise<{ playersUpdated: number }> {
    // Get all match events for goals, assists, and cards
    let allEvents = await db.select().from(matchEvents);
    
    // Filter by tournament if provided
    if (tournamentId) {
      const tournamentMatches = await db
        .select({ id: matches.id })
        .from(matches)
        .where(eq(matches.tournamentId, tournamentId));
      const matchIds = tournamentMatches.map(m => m.id);
      allEvents = allEvents.filter(e => matchIds.includes(e.matchId));
    }

    // Count events by player and type
    const playerStats: Record<string, { goals: number; assists: number; yellowCards: number; redCards: number }> = {};
    
    for (const event of allEvents) {
      if (!event.playerId) continue;
      
      if (!playerStats[event.playerId]) {
        playerStats[event.playerId] = { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      }
      
      if (event.eventType === 'goal') {
        playerStats[event.playerId].goals++;
      } else if (event.eventType === 'assist') {
        playerStats[event.playerId].assists++;
      } else if (event.eventType === 'yellow_card') {
        playerStats[event.playerId].yellowCards++;
      } else if (event.eventType === 'red_card') {
        playerStats[event.playerId].redCards++;
      }
    }

    // Update all players with recalculated stats
    let playersUpdated = 0;
    for (const [playerId, stats] of Object.entries(playerStats)) {
      await db.update(players)
        .set({
          goals: stats.goals,
          assists: stats.assists,
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
        })
        .where(eq(players.id, playerId));
      playersUpdated++;
    }

    // Reset stats for players not in the events (set to 0)
    const allPlayerIds = new Set(Object.keys(playerStats));
    const allPlayers = await db.select({ id: players.id }).from(players);
    for (const player of allPlayers) {
      if (!allPlayerIds.has(player.id)) {
        await db.update(players)
          .set({ goals: 0, assists: 0, yellowCards: 0, redCards: 0 })
          .where(eq(players.id, player.id));
        playersUpdated++;
      }
    }

    return { playersUpdated };
  }

  // Match Lineups
  async getMatchLineups(matchId: string, teamId?: string): Promise<MatchLineup[]> {
    if (teamId) {
      return await db
        .select()
        .from(matchLineups)
        .where(and(eq(matchLineups.matchId, matchId), eq(matchLineups.teamId, teamId)))
        .orderBy(matchLineups.positionNumber);
    }
    return await db
      .select()
      .from(matchLineups)
      .where(eq(matchLineups.matchId, matchId))
      .orderBy(matchLineups.teamId, matchLineups.positionNumber);
  }

  async createMatchLineup(insertLineup: InsertMatchLineup): Promise<MatchLineup> {
    const [lineup] = await db.insert(matchLineups).values(insertLineup).returning();
    return lineup;
  }

  async updateMatchLineup(id: string, updates: Partial<MatchLineup>): Promise<MatchLineup | undefined> {
    const [lineup] = await db.update(matchLineups).set(updates).where(eq(matchLineups.id, id)).returning();
    return lineup;
  }

  async deleteMatchLineup(id: string): Promise<boolean> {
    await db.delete(matchLineups).where(eq(matchLineups.id, id));
    return true;
  }

  // Match Comments
  async getMatchComments(matchId: string): Promise<MatchCommentWithUser[]> {
    const comments = await db
      .select()
      .from(matchComments)
      .where(eq(matchComments.matchId, matchId))
      .orderBy(desc(matchComments.createdAt));

    const commentsWithUsers: MatchCommentWithUser[] = [];
    for (const comment of comments) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
      }).from(users).where(eq(users.id, comment.userId));
      
      if (user) {
        commentsWithUsers.push({ ...comment, user });
      }
    }
    return commentsWithUsers;
  }

  async createMatchComment(insertComment: InsertMatchComment): Promise<MatchComment> {
    const [comment] = await db.insert(matchComments).values(insertComment).returning();
    return comment;
  }

  async deleteMatchComment(id: string, userId: string): Promise<boolean> {
    const [comment] = await db.select().from(matchComments).where(eq(matchComments.id, id));
    if (!comment || comment.userId !== userId) return false;
    await db.delete(matchComments).where(eq(matchComments.id, id));
    return true;
  }

  // Tournament Comments
  async getTournamentComments(tournamentId: string): Promise<(TournamentComment & { user: { id: string; fullName: string } })[]> {
    const comments = await db
      .select()
      .from(tournamentComments)
      .where(eq(tournamentComments.tournamentId, tournamentId))
      .orderBy(desc(tournamentComments.createdAt));

    const commentsWithUsers: (TournamentComment & { user: { id: string; fullName: string } })[] = [];
    for (const comment of comments) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
      }).from(users).where(eq(users.id, comment.userId));
      
      if (user) {
        commentsWithUsers.push({ ...comment, user });
      }
    }
    return commentsWithUsers;
  }

  async createTournamentComment(insertComment: InsertTournamentComment): Promise<TournamentComment> {
    const [comment] = await db.insert(tournamentComments).values(insertComment).returning();
    return comment;
  }

  async deleteTournamentComment(id: string, userId: string): Promise<boolean> {
    const [comment] = await db.select().from(tournamentComments).where(eq(tournamentComments.id, id));
    if (!comment || comment.userId !== userId) return false;
    await db.delete(tournamentComments).where(eq(tournamentComments.id, id));
    return true;
  }

  // Team Chats
  async getTeamChatRoom(teamId: string): Promise<{ id: string; teamId: string; name: string } | null> {
    let [room] = await db.select().from(teamChatRooms).where(eq(teamChatRooms.teamId, teamId));
    if (!room) {
      // Create room if it doesn't exist
      [room] = await db.insert(teamChatRooms).values({ teamId, name: "Team Chat" }).returning();
    }
    return room ? { id: room.id, teamId: room.teamId, name: room.name } : null;
  }

  async getTeamChatMessages(roomId: string): Promise<(TeamChatMessage & { user: { id: string; fullName: string } })[]> {
    const messages = await db
      .select()
      .from(teamChatMessages)
      .where(eq(teamChatMessages.roomId, roomId))
      .orderBy(asc(teamChatMessages.createdAt));

    const messagesWithUsers: (TeamChatMessage & { user: { id: string; fullName: string } })[] = [];
    for (const message of messages) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
      }).from(users).where(eq(users.id, message.userId));
      
      if (user) {
        messagesWithUsers.push({ ...message, user });
      }
    }
    return messagesWithUsers;
  }

  async createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage> {
    const [newMessage] = await db.insert(teamChatMessages).values(message).returning();
    return newMessage;
  }

  async checkTeamMemberAccess(teamId: string, userId: string): Promise<boolean> {
    // Check if user is a player on the team
    const [player] = await db.select().from(players).where(
      and(eq(players.teamId, teamId), eq(players.userId, userId))
    );
    if (player) return true;

    // Check if user is the team captain
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    if (team && team.captainId === userId) return true;

    return false;
  }

  // Event Hubs
  async getEventHub(id: string): Promise<(typeof eventHubs.$inferSelect & { polls: any[] }) | null> {
    const [hub] = await db.select().from(eventHubs).where(eq(eventHubs.id, id));
    if (!hub) return null;

    const hubPolls = await this.getHubPolls(id);
    return { ...hub, polls: hubPolls };
  }

  async getEventHubs(tournamentId?: string, matchId?: string): Promise<typeof eventHubs.$inferSelect[]> {
    if (matchId) {
      return await db.select().from(eventHubs).where(
        and(eq(eventHubs.matchId, matchId), eq(eventHubs.isActive, true))
      ).orderBy(desc(eventHubs.createdAt));
    }
    if (tournamentId) {
      return await db.select().from(eventHubs).where(
        and(eq(eventHubs.tournamentId, tournamentId), eq(eventHubs.isActive, true))
      ).orderBy(desc(eventHubs.createdAt));
    }
    return await db.select().from(eventHubs).where(eq(eventHubs.isActive, true))
      .orderBy(desc(eventHubs.createdAt));
  }

  async createEventHub(hub: { tournamentId?: string; matchId?: string; title: string; description?: string }): Promise<typeof eventHubs.$inferSelect> {
    const [newHub] = await db.insert(eventHubs).values({
      tournamentId: hub.tournamentId || null,
      matchId: hub.matchId || null,
      title: hub.title,
      description: hub.description || null,
      isActive: true,
    }).returning();
    return newHub;
  }

  async getHubPolls(hubId: string): Promise<(typeof polls.$inferSelect & { votes: typeof pollVotes.$inferSelect[] })[]> {
    const hubPolls = await db.select().from(polls).where(eq(polls.hubId, hubId))
      .orderBy(desc(polls.createdAt));
    
    const pollsWithVotes = [];
    for (const poll of hubPolls) {
      const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));
      pollsWithVotes.push({ ...poll, votes });
    }
    return pollsWithVotes;
  }

  async createPoll(poll: { hubId: string; question: string; type: string; options: string; closesAt?: Date }): Promise<typeof polls.$inferSelect> {
    const [newPoll] = await db.insert(polls).values({
      hubId: poll.hubId,
      question: poll.question,
      type: poll.type,
      options: poll.options,
      closesAt: poll.closesAt || null,
    }).returning();
    return newPoll;
  }

  async votePoll(vote: InsertPollVote): Promise<PollVote> {
    const [newVote] = await db.insert(pollVotes).values(vote).returning();
    return newVote;
  }

  async getPollResults(pollId: string): Promise<{ option: string; votes: number; percentage: number }[]> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
    if (!poll) return [];

    const options = JSON.parse(poll.options) as string[];
    const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, pollId));
    const totalVotes = votes.length;

    const results = options.map(option => {
      const optionVotes = votes.filter(v => {
        const selected = JSON.parse(v.selectedOptions) as string[];
        return selected.includes(option);
      }).length;
      return {
        option,
        votes: optionVotes,
        percentage: totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0,
      };
    });

    return results;
  }

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const [vote] = await db.select().from(pollVotes).where(
      and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId))
    );
    return !!vote;
  }

  // Media Comments
  async getMediaComments(mediaType: string, mediaId: string): Promise<(MediaComment & { user: { id: string; fullName: string } })[]> {
    const comments = await db
      .select()
      .from(mediaComments)
      .where(and(eq(mediaComments.mediaType, mediaType), eq(mediaComments.mediaId, mediaId)))
      .orderBy(desc(mediaComments.createdAt));

    const commentsWithUsers: (MediaComment & { user: { id: string; fullName: string } })[] = [];
    for (const comment of comments) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
      }).from(users).where(eq(users.id, comment.userId));
      
      if (user) {
        commentsWithUsers.push({ ...comment, user });
      }
    }
    return commentsWithUsers;
  }

  async createMediaComment(comment: InsertMediaComment): Promise<MediaComment> {
    const [newComment] = await db.insert(mediaComments).values(comment).returning();
    return newComment;
  }

  async deleteMediaComment(id: string, userId: string): Promise<boolean> {
    const [comment] = await db.select().from(mediaComments).where(eq(mediaComments.id, id));
    if (!comment || comment.userId !== userId) return false;
    await db.delete(mediaComments).where(eq(mediaComments.id, id));
    return true;
  }

  // Reactions
  async addReaction(reaction: InsertCommentReaction): Promise<CommentReaction> {
    // Check if user already reacted, remove old reaction first
    await db.delete(commentReactions).where(
      and(
        eq(commentReactions.commentType, reaction.commentType),
        eq(commentReactions.commentId, reaction.commentId),
        eq(commentReactions.userId, reaction.userId)
      )
    );
    const [newReaction] = await db.insert(commentReactions).values(reaction).returning();
    return newReaction;
  }

  async removeReaction(commentType: string, commentId: string, userId: string): Promise<boolean> {
    const result = await db.delete(commentReactions).where(
      and(
        eq(commentReactions.commentType, commentType),
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, userId)
      )
    ).returning();
    return result.length > 0;
  }

  async getCommentReactions(commentType: string, commentId: string, userId?: string): Promise<{ reactionType: string; count: number; userReaction?: string }[]> {
    const reactions = await db.select().from(commentReactions).where(
      and(
        eq(commentReactions.commentType, commentType),
        eq(commentReactions.commentId, commentId)
      )
    );

    const userReaction = userId ? reactions.find(r => r.userId === userId)?.reactionType : undefined;

    const reactionCounts: Record<string, number> = {};
    reactions.forEach(r => {
      if (!reactionCounts[r.reactionType]) {
        reactionCounts[r.reactionType] = 0;
      }
      reactionCounts[r.reactionType]++;
    });

    return Object.entries(reactionCounts).map(([type, count]) => ({
      reactionType: type,
      count,
      userReaction: userReaction === type ? userReaction : undefined,
    }));
  }

  // Private Chats
  async getUserChatRooms(userId: string): Promise<(typeof chatRooms.$inferSelect & { members: { userId: string; fullName: string }[]; lastMessage?: { content: string; createdAt: Date } })[]> {
    const memberRooms = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.userId, userId));
    const roomIds = memberRooms.map(m => m.roomId);

    if (roomIds.length === 0) return [];
    const rooms = await db.select().from(chatRooms).where(
      inArray(chatRooms.id, roomIds)
    );

    const roomsWithDetails = [];
    for (const room of rooms) {
      const members = await db.select({
        userId: chatRoomMembers.userId,
      }).from(chatRoomMembers).where(eq(chatRoomMembers.roomId, room.id));

      const membersWithNames = [];
      for (const member of members) {
        const [user] = await db.select({ id: users.id, fullName: users.fullName })
          .from(users).where(eq(users.id, member.userId));
        if (user) membersWithNames.push({ userId: user.id, fullName: user.fullName });
      }

      const [lastMsg] = await db.select().from(chatMessages)
        .where(eq(chatMessages.roomId, room.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      roomsWithDetails.push({
        ...room,
        members: membersWithNames,
        lastMessage: lastMsg ? { content: lastMsg.content, createdAt: lastMsg.createdAt } : undefined,
      });
    }

    return roomsWithDetails;
  }

  async createChatRoom(room: { type: string; name?: string; createdBy: string; memberIds: string[] }): Promise<typeof chatRooms.$inferSelect> {
    const [newRoom] = await db.insert(chatRooms).values({
      type: room.type,
      name: room.name || null,
      createdBy: room.createdBy,
    }).returning();

    // Add all members including creator
    const allMemberIds = [...new Set([room.createdBy, ...room.memberIds])];
    for (const memberId of allMemberIds) {
      await db.insert(chatRoomMembers).values({
        roomId: newRoom.id,
        userId: memberId,
      });
    }

    return newRoom;
  }

  async addChatMember(roomId: string, userId: string): Promise<void> {
    await db.insert(chatRoomMembers).values({
      roomId,
      userId,
    });
  }

  async getChatMessages(roomId: string): Promise<(ChatMessage & { user: { id: string; fullName: string } })[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt));

    const messagesWithUsers: (ChatMessage & { user: { id: string; fullName: string } })[] = [];
    for (const message of messages) {
      const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
      }).from(users).where(eq(users.id, message.userId));
      
      if (user) {
        messagesWithUsers.push({ ...message, user });
      }
    }
    return messagesWithUsers;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async markChatAsRead(roomId: string, userId: string): Promise<void> {
    await db.update(chatRoomMembers)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId)));
  }

  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const [member] = await db.select().from(chatRoomMembers).where(
      and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId))
    );
    if (!member || !member.lastReadAt) {
      const totalMessages = await db.select().from(chatMessages)
        .where(eq(chatMessages.roomId, roomId));
      return totalMessages.length;
    }

    const unreadMessages = await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.roomId, roomId),
        sql`${chatMessages.createdAt} > ${member.lastReadAt}`
      )
    );
    return unreadMessages.length;
  }

  // Team Evaluations
  async getTeamEvaluations(teamId: string): Promise<TeamEvaluation[]> {
    return await db
      .select()
      .from(teamEvaluations)
      .where(eq(teamEvaluations.teamId, teamId))
      .orderBy(desc(teamEvaluations.createdAt));
  }

  async createTeamEvaluation(insertEvaluation: InsertTeamEvaluation): Promise<TeamEvaluation> {
    const [evaluation] = await db.insert(teamEvaluations).values(insertEvaluation).returning();
    return evaluation;
  }

  // Update Team Standings
  async updateTeamStandings(tournamentId: string): Promise<void> {
    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    const matchesList = await db
      .select()
      .from(matches)
      .where(and(eq(matches.tournamentId, tournamentId), eq(matches.status, 'completed')));

    for (const team of tournamentTeams) {
      let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;

      for (const match of matchesList) {
        if (match.homeScore === null || match.awayScore === null) continue;

        if (match.homeTeamId === team.id) {
          played++;
          goalsFor += match.homeScore;
          goalsAgainst += match.awayScore;
          if (match.homeScore > match.awayScore) won++;
          else if (match.homeScore === match.awayScore) drawn++;
          else lost++;
        } else if (match.awayTeamId === team.id) {
          played++;
          goalsFor += match.awayScore;
          goalsAgainst += match.homeScore;
          if (match.awayScore > match.homeScore) won++;
          else if (match.awayScore === match.homeScore) drawn++;
          else lost++;
        }
      }

      const goalDifference = goalsFor - goalsAgainst;
      const points = (won * 3) + drawn;

      await db.update(teams).set({
        played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points
      }).where(eq(teams.id, team.id));
    }
  }

  // Site Settings
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (existing.length > 0) {
      const [updated] = await db.update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
