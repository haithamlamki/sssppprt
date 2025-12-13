import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hashPassword } from "./auth";
import passport from "passport";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});
import { 
  insertUserSchema, 
  insertEventRegistrationSchema,
  insertTournamentSchema,
  insertTeamSchema,
  insertPlayerSchema,
  insertMatchSchema,
  insertMatchEventSchema,
  insertMatchLineupSchema,
  insertMatchCommentSchema,
  insertTeamEvaluationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth endpoints
  const registerUpload = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'employeeCardImage', maxCount: 1 },
    { name: 'nationalIdImage', maxCount: 1 }
  ]);

  app.post("/api/auth/register", registerUpload, async (req, res) => {
    try {
      const { username, password, email, employeeId, accountType } = req.body;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل" });
      }

      // Check if employee ID already exists
      const existingEmployeeId = await storage.getUserByEmployeeId(employeeId);
      if (existingEmployeeId) {
        return res.status(400).json({ message: "رقم الموظف مسجل بالفعل" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Handle uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const profileImageUrl = files?.profileImage?.[0] ? `/uploads/${files.profileImage[0].filename}` : undefined;
      const employeeCardImageUrl = files?.employeeCardImage?.[0] ? `/uploads/${files.employeeCardImage[0].filename}` : undefined;
      const nationalIdImageUrl = files?.nationalIdImage?.[0] ? `/uploads/${files.nationalIdImage[0].filename}` : undefined;

      // Determine role based on account type
      let role = "employee";
      if (accountType === "committee") {
        role = "committee_member";
      }

      // Parse dates if provided
      const workStartDate = req.body.workStartDate ? new Date(req.body.workStartDate) : undefined;
      const workEndDate = req.body.workEndDate ? new Date(req.body.workEndDate) : undefined;

      // Create user data
      const userData = insertUserSchema.parse({
        ...req.body,
        password: hashedPassword,
        role,
        profileImageUrl,
        employeeCardImageUrl,
        nationalIdImageUrl,
        workStartDate,
        workEndDate,
      });

      const user = await storage.createUser(userData);

      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "فشل تسجيل الدخول التلقائي" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "فشل إنشاء الحساب" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "خطأ في تسجيل الدخول" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "خطأ في تسجيل الدخول" });
        }
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "فشل تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Events endpoints
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const event = await storage.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Event Registrations endpoints
  app.get("/api/events/:eventId/registrations", isAuthenticated, async (req, res) => {
    try {
      const registrations = await storage.getEventRegistrations(req.params.eventId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.get("/api/my-registrations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const registrations = await storage.getUserRegistrations(user.id);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user registrations" });
    }
  });

  app.post("/api/events/:eventId/register", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const eventId = req.params.eventId;

      // Check if event exists
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "الفعالية غير موجودة" });
      }

      // Check if user already registered
      const existingRegistration = await storage.getRegistration(eventId, user.id);
      if (existingRegistration) {
        return res.status(400).json({ message: "أنت مسجل بالفعل في هذه الفعالية" });
      }

      // Check if event is full
      if (event.maxParticipants && (event.currentParticipants || 0) >= event.maxParticipants) {
        return res.status(400).json({ message: "الفعالية ممتلئة" });
      }

      // Check shift availability for 2weeks_on_2weeks_off pattern
      if (user.shiftPattern === "2weeks_on_2weeks_off") {
        const eventDate = new Date(event.date);
        const referenceDate = new Date("2025-01-01"); // Reference start date
        const daysDiff = Math.floor((eventDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
        const cycleDay = daysDiff % 28; // 28-day cycle (14 on + 14 off)
        const isOnShift = cycleDay < 14;
        
        if (isOnShift) {
          return res.status(400).json({ 
            message: "لا يمكنك التسجيل في هذه الفعالية لأنك ستكون في فترة العمل",
            shiftConflict: true
          });
        }
      }

      // Create registration
      const registrationData = insertEventRegistrationSchema.parse({
        eventId,
        userId: user.id,
        status: "confirmed",
        ...req.body,
      });

      const registration = await storage.createEventRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "فشل التسجيل في الفعالية" });
    }
  });

  app.delete("/api/registrations/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const registrationId = req.params.id;

      // Get registration to verify ownership
      const [registration] = await storage.getEventRegistrations(registrationId);
      if (!registration) {
        return res.status(404).json({ message: "التسجيل غير موجود" });
      }

      // Check if user owns this registration or is admin
      if (registration.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "غير مصرح لك بإلغاء هذا التسجيل" });
      }

      const success = await storage.deleteEventRegistration(registrationId);
      if (!success) {
        return res.status(404).json({ message: "فشل إلغاء التسجيل" });
      }

      res.json({ message: "تم إلغاء التسجيل بنجاح" });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel registration" });
    }
  });

  // News endpoints
  app.get("/api/news", async (_req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", isAdmin, async (req, res) => {
    try {
      const news = await storage.createNews(req.body);
      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to create news" });
    }
  });

  // Results endpoints
  app.get("/api/results", async (_req, res) => {
    try {
      const results = await storage.getAllResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  app.post("/api/results", isAdmin, async (req, res) => {
    try {
      const result = await storage.createResult(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create result" });
    }
  });

  // Athletes endpoints
  app.get("/api/athletes", async (_req, res) => {
    try {
      const athletes = await storage.getAllAthletes();
      res.json(athletes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch athletes" });
    }
  });

  app.post("/api/athletes", isAdmin, async (req, res) => {
    try {
      const athlete = await storage.createAthlete(req.body);
      res.status(201).json(athlete);
    } catch (error) {
      res.status(500).json({ error: "Failed to create athlete" });
    }
  });

  // Gallery endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const { category } = req.query;
      const gallery = category 
        ? await storage.getGalleryByCategory(category as string)
        : await storage.getAllGallery();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.post("/api/gallery", isAdmin, async (req, res) => {
    try {
      const galleryItem = await storage.createGalleryItem(req.body);
      res.status(201).json(galleryItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create gallery item" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // User management endpoints (admin only)
  app.get("/api/users", isAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = allUsers.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id/role", isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!["employee", "admin", "committee_member"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUser(req.params.id, { role });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.patch("/api/users/:id/status", isAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      const updatedUser = await storage.updateUser(req.params.id, { isActive });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getUnreadNotificationsCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // Forum endpoints
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { category } = req.query;
      const posts = await storage.getAllPosts(category as string | undefined);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/forum/posts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const post = await storage.createPost({
        ...req.body,
        userId: user.id,
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/forum/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const success = await storage.deletePost(req.params.id, user.id);
      if (!success) {
        return res.status(403).json({ error: "Cannot delete this post" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.get("/api/forum/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getPostComments(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/forum/posts/:postId/comments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const comment = await storage.createComment({
        postId: req.params.postId,
        userId: user.id,
        content: req.body.content,
      });
      
      // Create notification for post owner
      const post = await storage.getPostById(req.params.postId);
      if (post && post.userId !== user.id) {
        await storage.createNotification({
          userId: post.userId,
          title: "تعليق جديد",
          message: `علّق ${user.fullName} على منشورك`,
          type: "info",
          isRead: false,
        });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/forum/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const success = await storage.deleteComment(req.params.id, user.id);
      if (!success) {
        return res.status(403).json({ error: "Cannot delete this comment" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.post("/api/forum/posts/:postId/like", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const liked = await storage.toggleLike(req.params.postId, user.id);
      
      // Create notification for post owner if liked
      if (liked) {
        const post = await storage.getPostById(req.params.postId);
        if (post && post.userId !== user.id) {
          await storage.createNotification({
            userId: post.userId,
            title: "إعجاب جديد",
            message: `أعجب ${user.fullName} بمنشورك`,
            type: "info",
            isRead: false,
          });
        }
      }
      
      res.json({ liked });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  app.get("/api/forum/posts/:postId/liked", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const liked = await storage.isPostLikedByUser(req.params.postId, user.id);
      res.json({ liked });
    } catch (error) {
      res.status(500).json({ error: "Failed to check like status" });
    }
  });

  // ========== LEAGUE GENERATOR ENDPOINTS ==========

  // Tournaments
  app.get("/api/tournaments", async (_req, res) => {
    try {
      const tournamentsList = await storage.getAllTournaments();
      res.json(tournamentsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournamentById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments", isAdmin, async (req, res) => {
    try {
      const body = { ...req.body };
      
      // Convert date strings to Date objects
      if (body.startDate && typeof body.startDate === 'string') {
        body.startDate = new Date(body.startDate);
      }
      if (body.endDate && typeof body.endDate === 'string') {
        body.endDate = new Date(body.endDate);
      }
      if (body.registrationStart && typeof body.registrationStart === 'string') {
        body.registrationStart = new Date(body.registrationStart);
      }
      if (body.registrationEnd && typeof body.registrationEnd === 'string') {
        body.registrationEnd = new Date(body.registrationEnd);
      }
      
      const tournamentData = insertTournamentSchema.parse(body);
      const tournament = await storage.createTournament(tournamentData);
      res.status(201).json(tournament);
    } catch (error: any) {
      console.error("Tournament creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create tournament" });
    }
  });

  app.patch("/api/tournaments/:id", isAdmin, async (req, res) => {
    try {
      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteTournament(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tournament" });
    }
  });

  app.post("/api/tournaments/:id/generate-matches", isAdmin, async (req, res) => {
    try {
      const generatedMatches = await storage.generateLeagueMatches(req.params.id);
      await storage.updateTournament(req.params.id, { status: "ongoing" });
      res.json({ matches: generatedMatches, count: generatedMatches.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate matches" });
    }
  });

  app.post("/api/tournaments/:id/generate-knockout", isAdmin, async (req, res) => {
    try {
      const generatedMatches = await storage.generateKnockoutMatchesFromGroups(req.params.id);
      res.json({ matches: generatedMatches, count: generatedMatches.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate knockout matches" });
    }
  });

  // Teams
  app.get("/api/teams", async (_req, res) => {
    try {
      const teamsList = await storage.getAllTeams();
      res.json(teamsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const teamData = insertTeamSchema.parse({
        ...req.body,
        captainId: req.body.captainId || user.id,
      });
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error: any) {
      console.error("Team creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create team" });
    }
  });

  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teamsList = await storage.getTeamsByTournament(req.params.tournamentId);
      res.json(teamsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeamById(req.params.id);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.post("/api/tournaments/:tournamentId/teams", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const teamData = insertTeamSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId,
        captainId: req.body.captainId || user.id,
      });
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.patch("/api/teams/:id", isAuthenticated, async (req, res) => {
    try {
      const team = await storage.updateTeam(req.params.id, req.body);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteTeam(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  // Players
  app.get("/api/players", async (_req, res) => {
    try {
      const playersList = await storage.getAllPlayers();
      res.json(playersList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.post("/api/players", isAuthenticated, async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error: any) {
      console.error("Player creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create player" });
    }
  });

  app.get("/api/teams/:teamId/players", async (req, res) => {
    try {
      const playersList = await storage.getPlayersByTeam(req.params.teamId);
      res.json(playersList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayerById(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  app.post("/api/teams/:teamId/players", isAuthenticated, async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse({
        ...req.body,
        teamId: req.params.teamId,
      });
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", isAuthenticated, async (req, res) => {
    try {
      const player = await storage.updatePlayer(req.params.id, req.body);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player" });
    }
  });

  app.delete("/api/players/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePlayer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  app.get("/api/tournaments/:tournamentId/top-scorers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topScorers = await storage.getTopScorers(req.params.tournamentId, limit);
      res.json(topScorers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top scorers" });
    }
  });

  // Matches
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matchesList = await storage.getMatchesByTournament(req.params.tournamentId);
      res.json(matchesList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  app.post("/api/tournaments/:tournamentId/matches", isAdmin, async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId,
      });
      const match = await storage.createMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  app.patch("/api/matches/:id", isAdmin, async (req, res) => {
    try {
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to update match" });
    }
  });

  app.delete("/api/matches/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteMatch(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete match" });
    }
  });

  // Match Events
  app.get("/api/matches/:matchId/events", async (req, res) => {
    try {
      const eventsList = await storage.getMatchEvents(req.params.matchId);
      res.json(eventsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match events" });
    }
  });

  app.post("/api/matches/:matchId/events", isAdmin, async (req, res) => {
    try {
      const eventData = insertMatchEventSchema.parse({
        ...req.body,
        matchId: req.params.matchId,
      });
      const event = await storage.createMatchEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create match event" });
    }
  });

  app.delete("/api/match-events/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteMatchEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete match event" });
    }
  });

  // Match Lineups
  app.get("/api/matches/:matchId/lineups", async (req, res) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      const lineupsList = await storage.getMatchLineups(req.params.matchId, teamId);
      res.json(lineupsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match lineups" });
    }
  });

  app.post("/api/matches/:matchId/lineups", isAuthenticated, async (req, res) => {
    try {
      const lineupData = insertMatchLineupSchema.parse({
        ...req.body,
        matchId: req.params.matchId,
      });
      const lineup = await storage.createMatchLineup(lineupData);
      res.status(201).json(lineup);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lineup" });
    }
  });

  app.patch("/api/lineups/:id", isAuthenticated, async (req, res) => {
    try {
      const lineup = await storage.updateMatchLineup(req.params.id, req.body);
      if (!lineup) {
        return res.status(404).json({ error: "Lineup not found" });
      }
      res.json(lineup);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lineup" });
    }
  });

  app.delete("/api/lineups/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMatchLineup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lineup" });
    }
  });

  // Match Comments
  app.get("/api/matches/:matchId/comments", async (req, res) => {
    try {
      const commentsList = await storage.getMatchComments(req.params.matchId);
      res.json(commentsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match comments" });
    }
  });

  app.post("/api/matches/:matchId/comments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const commentData = insertMatchCommentSchema.parse({
        ...req.body,
        matchId: req.params.matchId,
        userId: user.id,
      });
      const comment = await storage.createMatchComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/match-comments/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const success = await storage.deleteMatchComment(req.params.id, user.id);
      if (!success) {
        return res.status(403).json({ error: "Cannot delete this comment" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Team Evaluations
  app.get("/api/teams/:teamId/evaluations", async (req, res) => {
    try {
      const evaluations = await storage.getTeamEvaluations(req.params.teamId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch evaluations" });
    }
  });

  app.post("/api/teams/:teamId/evaluations", isAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const evaluationData = insertTeamEvaluationSchema.parse({
        ...req.body,
        teamId: req.params.teamId,
        evaluatorId: user.id,
      });
      const evaluation = await storage.createTeamEvaluation(evaluationData);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create evaluation" });
    }
  });

  // Standings recalculation endpoint
  app.post("/api/tournaments/:tournamentId/recalculate-standings", isAdmin, async (req, res) => {
    try {
      await storage.updateTeamStandings(req.params.tournamentId);
      const teamsList = await storage.getTeamsByTournament(req.params.tournamentId);
      res.json(teamsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to recalculate standings" });
    }
  });

  // ========== FILE UPLOAD ENDPOINT ==========
  app.post("/api/upload", isAuthenticated, upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Serve uploaded files statically
  app.use("/uploads", (await import("express")).default.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
