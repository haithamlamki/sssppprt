# اللجنة الرياضية - شركة أبراج لخدمات الطاقة

## نظرة عامة
منصة ويب شاملة للجنة الرياضية بشركة أبراج لخدمات الطاقة. التطبيق مصمم لعرض وإدارة الأنشطة الرياضية والترفيهية للموظفين وأسرهم.

## التقنيات المستخدمة

### Frontend
- **React** مع **TypeScript**
- **Wouter** للتوجيه (Routing)
- **TanStack Query** لإدارة حالة البيانات
- **Tailwind CSS** للتصميم
- **Shadcn UI** للمكونات الجاهزة
- **Framer Motion** للحركات والانتقالات

### Backend
- **Express.js** 
- **In-Memory Storage** لتخزين البيانات
- **TypeScript** للأمان النوعي

### التصميم
- تصميم عربي (RTL) بالكامل
- دعم الوضع الليلي (Dark Mode)
- تصميم متجاوب لجميع الأجهزة
- خطوط عربية احترافية (IBM Plex Sans Arabic, Tajawal)
- ألوان رياضية حيوية (أزرق، برتقالي، أخضر، ذهبي)

## الصفحات الرئيسية

### 1. الصفحة الرئيسية (`/`)
- قسم Hero جذاب مع صورة خلفية رياضية
- إحصائيات متحركة (عدد الفعاليات، المشاركين، الإنجازات)
- عرض الخدمات الرئيسية
- شريط أخبار متحرك
- الرؤية والرسالة

### 2. صفحة الفعاليات (`/events`)
- عرض جميع الفعاليات القادمة
- عداد تنازلي لكل فعالية
- تفاصيل كاملة (التاريخ، المكان، المشاركون، الشروط)
- شريط تقدم للمقاعد المتاحة
- زر تسجيل لكل فعالية

### 3. المعرض (`/gallery`)
- معرض صور للفعاليات السابقة
- تصفية حسب نوع النشاط
- تأثيرات Hover جذابة
- عرض التاريخ والوصف لكل صورة

### 4. النتائج والإنجازات (`/results`)
- نتائج البطولات السابقة
- لوحة الصدارة للأقسام
- اللاعبون المميزون
- عرض المراكز الثلاثة الأولى بتصميم مميز

### 5. من نحن (`/about`)
- نبذة عن اللجنة
- الرؤية والرسالة
- القيم والأهداف
- الإنجازات بالأرقام

## المكونات الرئيسية

### Header
- شعار اللجنة
- قائمة التنقل (Desktop و Mobile)
- زر تبديل الوضع الليلي

### Footer
- معلومات الاتصال
- روابط سريعة
- أيقونات وسائل التواصل الاجتماعي
- حقوق النشر

## نموذج البيانات

### Event (الفعالية)
```typescript
{
  id: string
  title: string
  description: string
  category: string
  date: Date
  location: string
  maxParticipants: number
  currentParticipants: number
  imageUrl: string
  status: string
  requirements: string
}
```

### News (الأخبار)
```typescript
{
  id: string
  title: string
  content: string
  date: Date
  category: string
}
```

### Result (النتيجة)
```typescript
{
  id: string
  tournamentName: string
  winner: string
  runnerUp: string
  thirdPlace: string
  date: Date
  category: string
}
```

### Athlete (الرياضي المميز)
```typescript
{
  id: string
  name: string
  position: string
  department: string
  achievements: string
  sport: string
}
```

### Gallery (معرض الصور)
```typescript
{
  id: string
  title: string
  category: string
  imageUrl: string
  eventDate: Date
  description: string
}
```

## API Endpoints

- `GET /api/events` - جلب جميع الفعاليات
- `GET /api/events/:id` - جلب فعالية محددة
- `POST /api/events` - إنشاء فعالية جديدة
- `GET /api/news` - جلب جميع الأخبار
- `GET /api/results` - جلب جميع النتائج
- `GET /api/athletes` - جلب الرياضيين المميزين
- `GET /api/gallery` - جلب معرض الصور
- `GET /api/gallery?category=football` - تصفية حسب الفئة
- `GET /api/stats` - جلب الإحصائيات العامة

## الميزات الخاصة

### Dark Mode
- دعم كامل للوضع الليلي
- تخزين التفضيل في LocalStorage
- تبديل سلس بين الأوضاع

### RTL Support
- تصميم كامل يدعم الاتجاه من اليمين لليسار
- خطوط عربية احترافية
- تناسق كامل في جميع المكونات

### Animations
- عداد تنازلي حي لكل فعالية
- أرقام متحركة في الإحصائيات
- تأثيرات Hover ناعمة
- شريط أخبار متحرك

### Responsive Design
- تصميم متجاوب لجميع الأحجام
- قائمة Mobile منفصلة
- Grid مرن للبطاقات

## التطوير المستقبلي

### المرحلة القادمة
1. نظام تسجيل الدخول للموظفين
2. التسجيل في الفعاليات
3. لوحة تحكم إدارية
4. نظام إشعارات
5. منتدى للتفاعل
6. قاعدة بيانات PostgreSQL

## الإعدادات

### Environment Variables
- `SESSION_SECRET` - مفتاح الجلسات (موجود)

### Scripts
- `npm run dev` - تشغيل التطبيق في وضع التطوير
- `npm run build` - بناء التطبيق للإنتاج

## آخر التحديثات

**يناير 2025**
- إطلاق النسخة الأولى (MVP)
- 5 صفحات رئيسية
- تصميم عربي كامل مع Dark Mode
- بيانات تجريبية شاملة
- API endpoints جاهزة
