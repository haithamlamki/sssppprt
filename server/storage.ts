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
  type Stats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // News
  getAllNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  
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
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private news: Map<string, News>;
  private results: Map<string, Result>;
  private athletes: Map<string, Athlete>;
  private gallery: Map<string, Gallery>;

  constructor() {
    this.events = new Map();
    this.news = new Map();
    this.results = new Map();
    this.athletes = new Map();
    this.gallery = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Events
    const sampleEvents: Event[] = [
      {
        id: randomUUID(),
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
        id: randomUUID(),
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
        id: randomUUID(),
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
        id: randomUUID(),
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
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));

    // Sample News
    const sampleNews: News[] = [
      {
        id: randomUUID(),
        title: "فريق الهندسة يتوج بطلاً لدوري كرة القدم الداخلي",
        content: "في مباراة نهائية مثيرة، تمكن فريق قسم الهندسة من التتويج بلقب بطولة كرة القدم الداخلية بعد فوزه على فريق المالية بنتيجة 3-2",
        date: new Date(),
        category: "result",
      },
      {
        id: randomUUID(),
        title: "التسجيل مفتوح الآن لبطولة كرة السلة السنوية",
        content: "يسر اللجنة الرياضية أن تعلن عن فتح باب التسجيل لبطولة كرة السلة السنوية. آخر موعد للتسجيل 10 مارس 2025",
        date: new Date(),
        category: "announcement",
      },
    ];

    sampleNews.forEach(news => this.news.set(news.id, news));

    // Sample Results
    const sampleResults: Result[] = [
      {
        id: randomUUID(),
        eventId: null,
        tournamentName: "بطولة كرة القدم السنوية 2024",
        winner: "فريق الهندسة",
        runnerUp: "فريق المالية",
        thirdPlace: "فريق التشغيل",
        date: new Date(2024, 11, 15),
        category: "football",
      },
      {
        id: randomUUID(),
        eventId: null,
        tournamentName: "دوري كرة السلة الداخلي 2024",
        winner: "فريق تقنية المعلومات",
        runnerUp: "فريق الموارد البشرية",
        thirdPlace: "فريق المشتريات",
        date: new Date(2024, 10, 20),
        category: "basketball",
      },
    ];

    sampleResults.forEach(result => this.results.set(result.id, result));

    // Sample Athletes
    const sampleAthletes: Athlete[] = [
      {
        id: randomUUID(),
        name: "عبدالله الشمري",
        position: "مهندس كهرباء",
        department: "قسم الهندسة",
        achievements: "هداف بطولة كرة القدم 2024 (18 هدف)",
        sport: "كرة قدم",
        imageUrl: null,
      },
      {
        id: randomUUID(),
        name: "سارة القحطاني",
        position: "محلل أعمال",
        department: "قسم تقنية المعلومات",
        achievements: "أفضل لاعبة في دوري كرة السلة النسائي",
        sport: "كرة سلة",
        imageUrl: null,
      },
    ];

    sampleAthletes.forEach(athlete => this.athletes.set(athlete.id, athlete));

    // Sample Gallery
    const sampleGallery: Gallery[] = [
      {
        id: randomUUID(),
        title: "نهائي بطولة كرة القدم 2024",
        category: "football",
        imageUrl: "/assets/football.png",
        eventDate: new Date(2024, 11, 15),
        description: "لحظات التتويج من نهائي بطولة كرة القدم السنوية",
      },
      {
        id: randomUUID(),
        title: "اليوم العائلي الترفيهي",
        category: "family",
        imageUrl: "/assets/family.png",
        eventDate: new Date(2024, 10, 10),
        description: "أجواء مليئة بالمرح والسعادة مع العائلات",
      },
    ];

    sampleGallery.forEach(item => this.gallery.set(item.id, item));
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      currentParticipants: insertEvent.currentParticipants ?? 0,
      status: insertEvent.status ?? "upcoming"
    };
    this.events.set(id, event);
    return event;
  }

  // News
  async getAllNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = randomUUID();
    const news: News = { ...insertNews, id };
    this.news.set(id, news);
    return news;
  }

  // Results
  async getAllResults(): Promise<Result[]> {
    return Array.from(this.results.values()).sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = randomUUID();
    const result: Result = { ...insertResult, id };
    this.results.set(id, result);
    return result;
  }

  // Athletes
  async getAllAthletes(): Promise<Athlete[]> {
    return Array.from(this.athletes.values());
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const id = randomUUID();
    const athlete: Athlete = { ...insertAthlete, id };
    this.athletes.set(id, athlete);
    return athlete;
  }

  // Gallery
  async getAllGallery(): Promise<Gallery[]> {
    return Array.from(this.gallery.values()).sort((a, b) => 
      b.eventDate.getTime() - a.eventDate.getTime()
    );
  }

  async getGalleryByCategory(category: string): Promise<Gallery[]> {
    return Array.from(this.gallery.values())
      .filter(item => item.category === category)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  }

  async createGalleryItem(insertGallery: InsertGallery): Promise<Gallery> {
    const id = randomUUID();
    const galleryItem: Gallery = { ...insertGallery, id };
    this.gallery.set(id, galleryItem);
    return galleryItem;
  }

  // Stats
  async getStats(): Promise<Stats> {
    return {
      totalEvents: this.events.size,
      totalParticipants: Array.from(this.events.values()).reduce(
        (sum, event) => sum + (event.currentParticipants ?? 0), 
        0
      ),
      totalAchievements: this.results.size,
      activeSports: new Set(
        Array.from(this.events.values()).map(e => e.category)
      ).size,
    };
  }
}

export const storage = new MemStorage();
