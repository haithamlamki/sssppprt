import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hashPassword } from "./auth";
import passport from "passport";
import { insertUserSchema, insertEventRegistrationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, employeeId } = req.body;

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

      // Create user
      const userData = insertUserSchema.parse({
        ...req.body,
        password: hashedPassword,
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

  const httpServer = createServer(app);
  return httpServer;
}
