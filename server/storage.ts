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
  teamEvaluations,
  referees,
  siteSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, asc } from "drizzle-orm";

export interface IStorage {
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
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
  
  // Match Lineups
  getMatchLineups(matchId: string, teamId?: string): Promise<MatchLineup[]>;
  createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup>;
  updateMatchLineup(id: string, updates: Partial<MatchLineup>): Promise<MatchLineup | undefined>;
  deleteMatchLineup(id: string): Promise<boolean>;
  
  // Match Comments
  getMatchComments(matchId: string): Promise<MatchCommentWithUser[]>;
  createMatchComment(comment: InsertMatchComment): Promise<MatchComment>;
  deleteMatchComment(id: string, userId: string): Promise<boolean>;
  
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

    const allPlayers = await db
      .select()
      .from(players)
      .orderBy(desc(players.goals));

    const scorers: PlayerWithTeam[] = [];
    for (const player of allPlayers) {
      if (player.teamId && teamIds.includes(player.teamId) && player.goals > 0) {
        const team = tournamentTeams.find(t => t.id === player.teamId);
        if (team) {
          scorers.push({ ...player, team });
          if (scorers.length >= limit) break;
        }
      }
    }
    return scorers;
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
      const [homeTeam] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId));
      const [awayTeam] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId));
      if (homeTeam && awayTeam) {
        matchesWithTeams.push({ ...match, homeTeam, awayTeam });
      }
    }
    return matchesWithTeams;
  }

  async getMatchById(id: string): Promise<MatchWithTeams | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match) return undefined;

    const [homeTeam] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId));
    const [awayTeam] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId));
    if (!homeTeam || !awayTeam) return undefined;

    return { ...match, homeTeam, awayTeam };
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    
    // If score is updated, recalculate standings
    if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
      const fullMatch = await this.getMatchById(id);
      if (fullMatch) {
        await this.updateTeamStandings(fullMatch.tournamentId);
      }
    }
    
    return match;
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
    let scheduleConfig = { matchesPerDay: 2, dailyStartTime: "16:00" };
    if (tournament.scheduleConfig) {
      try {
        scheduleConfig = { ...scheduleConfig, ...JSON.parse(tournament.scheduleConfig) };
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
    
    // Calculate time slots per venue
    const timeSlotsPerVenue = Math.ceil(matchesPerDay / numberOfVenues);
    
    let currentDate = new Date(startDate);
    let matchesScheduledToday = 0;
    let currentVenueIndex = 0;
    let currentTimeSlotInVenue = 0;

    for (const matchPair of allMatchPairs) {
      // Calculate match time based on venue and time slot
      const matchDate = new Date(currentDate);
      const totalMinutesOffset = currentTimeSlotInVenue * matchDurationMinutes;
      const slotHour = startHour + Math.floor(totalMinutesOffset / 60);
      const slotMinute = startMinute + (totalMinutesOffset % 60);
      matchDate.setHours(slotHour, slotMinute, 0, 0);

      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: matchPair.homeTeam.id,
        awayTeamId: matchPair.awayTeam.id,
        round: matchPair.round,
        leg: matchPair.leg,
        stage: tournament.hasGroupStage ? 'group' : 'league',
        groupNumber: matchPair.homeTeam.groupNumber,
        matchDate,
        venue: venuesList[currentVenueIndex],
        status: 'scheduled',
      }).returning();
      generatedMatches.push(match);

      matchesScheduledToday++;
      
      // Move to next venue for the same time slot, or next time slot
      currentVenueIndex++;
      if (currentVenueIndex >= numberOfVenues) {
        currentVenueIndex = 0;
        currentTimeSlotInVenue++;
      }

      // Move to next day if needed
      if (matchesScheduledToday >= matchesPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        currentTimeSlotInVenue = 0;

        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          // Reset to start and continue (wrap around)
          currentDate = new Date(startDate);
        }
      }
    }

    return generatedMatches;
  }

  async generateKnockoutMatchesFromGroups(tournamentId: string): Promise<Match[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (!tournament.hasGroupStage) throw new Error("Tournament doesn't have group stage");

    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    
    // Group teams by groupNumber and sort by points
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

    // Get qualified teams (top 2 from each group)
    const qualifiedTeams: { team: Team; position: number; groupNumber: number }[] = [];
    const groups = Object.keys(groupedTeams).map(Number).sort((a, b) => a - b);
    
    for (const groupNum of groups) {
      const groupTeams = groupedTeams[groupNum];
      if (groupTeams.length >= 2) {
        qualifiedTeams.push({ team: groupTeams[0], position: 1, groupNumber: groupNum });
        qualifiedTeams.push({ team: groupTeams[1], position: 2, groupNumber: groupNum });
      }
    }

    if (qualifiedTeams.length < 2) {
      throw new Error("Not enough qualified teams for knockout stage");
    }

    // Delete existing knockout matches
    await db.delete(matches)
      .where(
        and(
          eq(matches.tournamentId, tournamentId),
          sql`${matches.stage} != 'group' AND ${matches.stage} != 'league'`
        )
      );

    const generatedMatches: Match[] = [];
    const numQualified = qualifiedTeams.length;

    // Determine the stage based on number of teams
    let stage: string;
    if (numQualified >= 16) stage = 'round_of_16';
    else if (numQualified >= 8) stage = 'quarter_final';
    else if (numQualified >= 4) stage = 'semi_final';
    else stage = 'final';

    // Generate matchups: 1st of group A vs 2nd of group B, etc.
    const matchups: { home: Team; away: Team }[] = [];
    
    if (groups.length >= 2) {
      // Cross-group matching: 1st of group plays 2nd of another group
      for (let i = 0; i < groups.length; i += 2) {
        const groupA = groups[i];
        const groupB = groups[i + 1] || groups[i];
        
        const firstA = qualifiedTeams.find(t => t.groupNumber === groupA && t.position === 1);
        const secondB = qualifiedTeams.find(t => t.groupNumber === groupB && t.position === 2);
        const firstB = qualifiedTeams.find(t => t.groupNumber === groupB && t.position === 1);
        const secondA = qualifiedTeams.find(t => t.groupNumber === groupA && t.position === 2);
        
        if (firstA && secondB) {
          matchups.push({ home: firstA.team, away: secondB.team });
        }
        if (firstB && secondA && groupA !== groupB) {
          matchups.push({ home: firstB.team, away: secondA.team });
        }
      }
    } else {
      // Single group: just match 1st vs 2nd
      const first = qualifiedTeams.find(t => t.position === 1);
      const second = qualifiedTeams.find(t => t.position === 2);
      if (first && second) {
        matchups.push({ home: first.team, away: second.team });
      }
    }

    // Create matches
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 7); // Start a week from now

    for (let i = 0; i < matchups.length; i++) {
      const matchup = matchups[i];
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + Math.floor(i / 2) * 2);

      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: matchup.home.id,
        awayTeamId: matchup.away.id,
        round: i + 1,
        leg: 1,
        stage,
        matchDate,
        venue: tournament.venues && tournament.venues.length > 0 
          ? tournament.venues[i % tournament.venues.length] 
          : null,
        status: 'scheduled',
      }).returning();
      
      generatedMatches.push(match);
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
    if (!tournament.hasGroupStage) throw new Error("Tournament doesn't have group stage");
    
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
    const matchesPerDay = options?.matchesPerDay || 4;
    const hasSecondLeg = tournament.hasSecondLeg ?? true;
    const dailyStartTime = options?.dailyStartTime || "16:00";
    
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
    
    // Schedule settings
    let startDate = tournament.startDate ? new Date(tournament.startDate) : new Date();
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
    let currentDate = new Date(startDate);
    let matchesScheduledToday = 0;
    let currentVenueIndex = 0;
    let currentTimeSlotInVenue = 0;
    
    // Generate round-robin matches for each group - collect all pairs first
    const allMatchPairs: { home: Team; away: Team; round: number; leg: number; groupNum: number }[] = [];
    const groups = Object.keys(groupedTeams).map(Number).sort((a, b) => a - b);
    
    for (const groupNum of groups) {
      const groupTeams = groupedTeams[groupNum];
      if (groupTeams.length < 2) continue;
      
      // Generate round-robin pairs
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          allMatchPairs.push({ 
            home: groupTeams[i], 
            away: groupTeams[j], 
            round: allMatchPairs.length + 1, 
            leg: 1,
            groupNum 
          });
          
          if (hasSecondLeg) {
            allMatchPairs.push({ 
              home: groupTeams[j], 
              away: groupTeams[i], 
              round: allMatchPairs.length + 1, 
              leg: 2,
              groupNum 
            });
          }
        }
      }
    }
    
    // Create matches with venue-based time slots
    for (const matchPair of allMatchPairs) {
      // Calculate match time based on venue and time slot
      const matchDate = new Date(currentDate);
      const totalMinutesOffset = currentTimeSlotInVenue * matchDurationMinutes;
      const slotHour = startHour + Math.floor(totalMinutesOffset / 60);
      const slotMinute = startMinute + (totalMinutesOffset % 60);
      matchDate.setHours(slotHour, slotMinute, 0, 0);
      
      const [match] = await db.insert(matches).values({
        tournamentId,
        homeTeamId: matchPair.home.id,
        awayTeamId: matchPair.away.id,
        round: matchPair.round,
        leg: matchPair.leg,
        stage: 'group',
        groupNumber: matchPair.groupNum,
        matchDate,
        venue: venuesList[currentVenueIndex],
        status: 'scheduled',
      }).returning();
      
      generatedMatches.push(match);
      matchesScheduledToday++;
      
      // Move to next venue for the same time slot, or next time slot
      currentVenueIndex++;
      if (currentVenueIndex >= numberOfVenues) {
        currentVenueIndex = 0;
        currentTimeSlotInVenue++;
      }
      
      // Move to next day if needed
      if (matchesScheduledToday >= matchesPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
        currentVenueIndex = 0;
        currentTimeSlotInVenue = 0;
        
        // Check if we exceeded end date
        if (endDate && currentDate > endDate) {
          currentDate = new Date(startDate);
        }
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
    await db.delete(matchEvents).where(eq(matchEvents.id, id));
    return true;
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
