# اللجنة الرياضية - شركة أبراج لخدمات الطاقة

## نظرة عامة
منصة ويب شاملة للجنة الرياضية بشركة أبراج لخدمات الطاقة. التطبيق مصمم لعرض وإدارة الأنشطة الرياضية والترفيهية للموظفين وأسرهم مع دعم كامل للمصادقة والتسجيل في الفعاليات والمنتدى التفاعلي.

## التقنيات المستخدمة

### Frontend
- **React** مع **TypeScript**
- **Wouter** للتوجيه (Routing)
- **TanStack Query** لإدارة حالة البيانات
- **Tailwind CSS** للتصميم
- **Shadcn UI** للمكونات الجاهزة
- **Framer Motion** للحركات والانتقالات

### Backend
- **Express.js** مع **TypeScript**
- **PostgreSQL** مع **Drizzle ORM**
- **Passport.js** للمصادقة مع Sessions
- **bcrypt** لتشفير كلمات المرور

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
- عرض جميع الفعاليات من قاعدة البيانات
- عداد تنازلي لكل فعالية
- تفاصيل كاملة (التاريخ، المكان، المشاركون، الشروط)
- شريط تقدم للمقاعد المتاحة
- زر تسجيل مع تكامل المصادقة
- عرض حالة التسجيل للمستخدم

### 3. المنتدى التفاعلي (`/forum`) - جديد!
- حائط اجتماعي للموظفين
- نشر منشورات نصية
- نظام التعليقات
- نظام الإعجابات
- تصفية حسب الفئة (كرة قدم، كرة سلة، جري، عائلي، عام)

### 4. نظام البطولات والدوريات (`/leagues`) - جديد!
- **صفحة البطولات** `/leagues` - عرض جميع البطولات مع التصفية حسب الحالة
- **تفاصيل البطولة** `/leagues/:id` - الترتيب، المباريات، الهدافين، الفرق
- **تفاصيل المباراة** `/matches/:id` - الأحداث، التشكيلات، التعليقات
- أنواع البطولات: دوري كامل (Round Robin)، خروج مغلوب (Knockout)، مجموعات (Groups)
- تسجيل الفرق واللاعبين
- توليد جدول المباريات تلقائياً
- تتبع النتائج والترتيب والهدافين
- تعليقات المباريات المباشرة
- دعم البث المباشر والملخصات

### 5. المعرض (`/gallery`)
- معرض صور للفعاليات السابقة
- تصفية حسب نوع النشاط
- تأثيرات Hover جذابة
- عرض التاريخ والوصف لكل صورة

### 6. النتائج والإنجازات (`/results`)
- نتائج البطولات السابقة
- لوحة الصدارة للأقسام
- اللاعبون المميزون
- عرض المراكز الثلاثة الأولى بتصميم مميز

### 7. من نحن (`/about`)
- نبذة عن اللجنة
- الرؤية والرسالة
- القيم والأهداف
- الإنجازات بالأرقام

### 8. صفحات المصادقة
- **تسجيل الدخول** (`/login`) - نموذج تسجيل دخول مع تحقق
- **إنشاء حساب** (`/register`) - تسجيل موظف جديد مع معلومات العمل
- **الملف الشخصي** (`/profile`) - عرض معلومات المستخدم وجدول الدوام
- **فعالياتي** (`/my-events`) - الفعاليات المسجل فيها المستخدم

### 9. لوحة التحكم الإدارية (`/admin`)
- للمديرين وأعضاء اللجنة فقط
- إحصائيات شاملة
- إدارة الفعاليات (إضافة/عرض)
- إدارة البطولات (إضافة/عرض/توليد جدول المباريات)
- إدارة الأخبار (إضافة/عرض)
- إدارة النتائج (إضافة/عرض)

## نظام المصادقة

### الميزات
- تسجيل موظفين جدد مع رقم الموظف
- تسجيل دخول آمن مع bcrypt
- جلسات مستمرة مع connect-pg-simple
- صلاحيات متعددة (موظف، مدير، عضو لجنة)
- جدول الورديات (2 أسبوع عمل / 2 أسبوع إجازة)

### حسابات الاختبار
```
اسم المستخدم: ahmed.ali | كلمة المرور: password123 (موظف)
اسم المستخدم: admin | كلمة المرور: password123 (مدير)
```

## نظام الإشعارات

### الميزات
- إشعارات داخل التطبيق
- عداد للإشعارات غير المقروءة
- أيقونة الجرس في الـ Header
- إشعارات للتعليقات والإعجابات
- تعليم الكل كمقروء

## نموذج البيانات (PostgreSQL)

### User (المستخدم)
```typescript
{
  id: string
  username: string
  password: string (hashed)
  fullName: string
  email: string
  employeeId: string
  department: string
  position: string
  phoneNumber: string
  shiftPattern: string // 2weeks_on_2weeks_off, normal, flexible
  currentShiftStatus: string // available, on_shift, off_shift
  role: string // employee, admin, committee_member
  isActive: boolean
}
```

### Event (الفعالية)
```typescript
{
  id: string
  title: string
  description: string
  category: string // football, basketball, marathon, family
  date: Date
  location: string
  maxParticipants: number
  currentParticipants: number
  imageUrl: string
  status: string
  requirements: string
}
```

### EventRegistration (التسجيل في الفعاليات)
```typescript
{
  id: string
  eventId: string
  userId: string
  registrationDate: Date
  status: string // confirmed, waitlist, cancelled, attended
  teamName: string
}
```

### Notification (الإشعارات)
```typescript
{
  id: string
  userId: string
  title: string
  message: string
  type: string // info, success, warning, event, registration
  isRead: boolean
  createdAt: Date
}
```

### ForumPost (منشور المنتدى)
```typescript
{
  id: string
  userId: string
  content: string
  category: string
  likesCount: number
  commentsCount: number
  createdAt: Date
}
```

### ForumComment (تعليق)
```typescript
{
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Date
}
```

## API Endpoints

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - معلومات المستخدم الحالي

### الفعاليات
- `GET /api/events` - جلب جميع الفعاليات
- `GET /api/events/:id` - جلب فعالية محددة
- `POST /api/events` - إنشاء فعالية (admin)
- `POST /api/events/:id/register` - التسجيل في فعالية
- `GET /api/my-registrations` - فعاليات المستخدم
- `DELETE /api/registrations/:id` - إلغاء التسجيل

### الإشعارات
- `GET /api/notifications` - جلب الإشعارات
- `GET /api/notifications/unread-count` - عدد غير المقروءة
- `POST /api/notifications/:id/read` - تعليم كمقروء
- `POST /api/notifications/read-all` - قراءة الكل

### المنتدى
- `GET /api/forum/posts` - جلب المنشورات
- `POST /api/forum/posts` - إنشاء منشور
- `DELETE /api/forum/posts/:id` - حذف منشور
- `GET /api/forum/posts/:id/comments` - تعليقات المنشور
- `POST /api/forum/posts/:id/comments` - إضافة تعليق
- `POST /api/forum/posts/:id/like` - إعجاب/إلغاء إعجاب

### أخرى
- `GET /api/news` - جلب الأخبار
- `POST /api/news` - إضافة خبر (admin)
- `GET /api/results` - جلب النتائج
- `POST /api/results` - إضافة نتيجة (admin)
- `GET /api/gallery` - جلب المعرض
- `GET /api/stats` - الإحصائيات

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

## الإعدادات

### Environment Variables
- `DATABASE_URL` - رابط قاعدة البيانات PostgreSQL
- `SESSION_SECRET` - مفتاح الجلسات

### Scripts
- `npm run dev` - تشغيل التطبيق في وضع التطوير
- `npm run build` - بناء التطبيق للإنتاج
- `npm run db:push` - تحديث قاعدة البيانات

## آخر التحديثات

**ديسمبر 2024 - Phase 2**
- نظام المصادقة الكامل مع Passport.js
- التسجيل في الفعاليات
- لوحة التحكم الإدارية
- نظام الإشعارات داخل التطبيق
- المنتدى التفاعلي مع التعليقات والإعجابات
- ترحيل قاعدة البيانات إلى PostgreSQL

**يناير 2025 - Phase 1**
- إطلاق النسخة الأولى (MVP)
- 5 صفحات رئيسية
- تصميم عربي كامل مع Dark Mode
- بيانات تجريبية شاملة
- API endpoints جاهزة
