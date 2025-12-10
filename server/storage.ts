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
  type MatchWithTeams,
  type PlayerWithTeam,
  type MatchCommentWithUser,
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
  teamEvaluations
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
  
  // Matches
  getMatchesByTournament(tournamentId: string): Promise<MatchWithTeams[]>;
  getMatchById(id: string): Promise<MatchWithTeams | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  generateLeagueMatches(tournamentId: string): Promise<Match[]>;
  
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
  
  // Initialization
  initializeSampleData(): Promise<void>;
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
      if (teamIds.includes(player.teamId) && player.goals > 0) {
        const team = tournamentTeams.find(t => t.id === player.teamId);
        if (team) {
          scorers.push({ ...player, team });
          if (scorers.length >= limit) break;
        }
      }
    }
    return scorers;
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

  async generateLeagueMatches(tournamentId: string): Promise<Match[]> {
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const tournamentTeams = await this.getTeamsByTournament(tournamentId);
    if (tournamentTeams.length < 2) throw new Error("Not enough teams");

    // Delete existing matches
    await db.delete(matches).where(eq(matches.tournamentId, tournamentId));

    const generatedMatches: Match[] = [];
    const teamsList = [...tournamentTeams];

    // Add ghost team if odd number
    if (teamsList.length % 2 !== 0) {
      teamsList.push({ id: 'ghost', name: 'BYE' } as Team);
    }

    const numTeams = teamsList.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

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

        // First leg (ذهاب)
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() + (round * 7));

        const [match1] = await db.insert(matches).values({
          tournamentId,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          round: round + 1,
          leg: 1,
          stage: tournament.hasGroupStage ? 'group' : 'league',
          groupNumber: homeTeam.groupNumber,
          matchDate,
          venue: tournament.venues && tournament.venues.length > 0 
            ? tournament.venues[round % tournament.venues.length] 
            : null,
          status: 'scheduled',
        }).returning();
        generatedMatches.push(match1);

        // Second leg (إياب) if enabled
        if (tournament.hasSecondLeg) {
          const returnDate = new Date(matchDate);
          returnDate.setDate(returnDate.getDate() + (numRounds * 7));

          const [match2] = await db.insert(matches).values({
            tournamentId,
            homeTeamId: awayTeam.id,
            awayTeamId: homeTeam.id,
            round: numRounds + round + 1,
            leg: 2,
            stage: tournament.hasGroupStage ? 'group' : 'league',
            groupNumber: homeTeam.groupNumber,
            matchDate: returnDate,
            venue: tournament.venues && tournament.venues.length > 0 
              ? tournament.venues[(numRounds + round) % tournament.venues.length] 
              : null,
            status: 'scheduled',
          }).returning();
          generatedMatches.push(match2);
        }
      }
    }

    return generatedMatches;
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
}

export const storage = new DatabaseStorage();
