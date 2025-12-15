# استكشاف أخطاء قاعدة البيانات في Vercel

## المشكلة
الموقع يعمل لكن قاعدة البيانات لا تعمل - خطأ 500 عند محاولة تسجيل الدخول أو الوصول للبيانات.

## خطوات التحقق السريعة

### 1. تحقق من Environment Variables في Vercel

1. **افتح Vercel Dashboard**
   - https://vercel.com/dashboard
   - اختر مشروع `abraj-sport-2025`

2. **اذهب إلى Environment Variables**
   - Settings → Environment Variables

3. **تحقق من وجود:**
   - ✅ `DATABASE_URL` - يجب أن يكون موجود
   - ✅ `SESSION_SECRET` - يجب أن يكون موجود

4. **تحقق من القيم:**
   - `DATABASE_URL` يجب أن يكون:
     ```
     postgresql://postgres.ganuizvmmozagyzotohx:vRHVi8BFfddL9DEd@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```
   - `SESSION_SECRET` يجب أن يكون موجود

### 2. تحقق من Vercel Logs

1. **اذهب إلى Deployments**
   - اختر آخر deployment

2. **افتح Functions**
   - اضغط على Functions tab
   - اضغط على `/api/index`

3. **تحقق من Logs**
   - ابحث عن أخطاء مثل:
     - "DATABASE_URL must be set"
     - "Connection timeout"
     - "Authentication failed"
     - "Invalid DATABASE_URL format"

### 3. تحقق من Supabase

1. **افتح Supabase Dashboard**
   - https://supabase.com/dashboard
   - اختر مشروعك

2. **تحقق من Database Status**
   - Database → Connection Pooling
   - تحقق من Active connections

3. **تحقق من كلمة المرور**
   - Settings → Database
   - تأكد من كلمة المرور

## الحلول الشائعة

### الحل 1: إعادة إضافة DATABASE_URL

1. في Vercel Environment Variables:
   - احذف `DATABASE_URL` القديم (إن وجد)
   - أضف جديد:
     - Key: `DATABASE_URL`
     - Value: `postgresql://postgres.ganuizvmmozagyzotohx:vRHVi8BFfddL9DEd@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
     - Environment: Production, Preview, Development
   - Save

2. **أعد النشر**
   - Deployments → Redeploy

### الحل 2: التحقق من صحة Connection String

**Connection String الصحيح:**
```
postgresql://postgres.ganuizvmmozagyzotohx:vRHVi8BFfddL9DEd@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**التحقق:**
- ✅ User: `postgres.ganuizvmmozagyzotohx` (مع Project ID)
- ✅ Password: `vRHVi8BFfddL9DEd`
- ✅ Host: `aws-1-ap-southeast-1.pooler.supabase.com`
- ✅ Port: `5432`
- ✅ Database: `postgres`

### الحل 3: اختبار الاتصال محلياً

1. **أنشئ ملف `.env` محلياً:**
   ```
   DATABASE_URL=postgresql://postgres.ganuizvmmozagyzotohx:vRHVi8BFfddL9DEd@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
   SESSION_SECRET=f0iCSaaTypc9kHkw/K+lft2mR/frvNAiZeACKqxpIn4=
   ```

2. **اختبر الاتصال:**
   ```bash
   npm run dev
   ```
   - جرب تسجيل الدخول محلياً
   - إذا عمل محلياً، المشكلة في Vercel Environment Variables

### الحل 4: إعادة تعيين كلمة المرور

إذا كان هناك شك في كلمة المرور:

1. **في Supabase:**
   - Settings → Database
   - Reset database password
   - انسخ كلمة المرور الجديدة

2. **حدّث DATABASE_URL في Vercel:**
   - استبدل كلمة المرور في Connection String
   - أعد النشر

## أخطاء شائعة وحلولها

### خطأ: "DATABASE_URL must be set"
**الحل:** أضف `DATABASE_URL` في Vercel Environment Variables

### خطأ: "Invalid DATABASE_URL format"
**الحل:** تحقق من صحة الصيغة:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### خطأ: "Connection timeout"
**الحل:** 
- استخدم Connection Pooler (Session pooler)
- تحقق من أن Supabase database يعمل

### خطأ: "Authentication failed"
**الحل:**
- تحقق من كلمة المرور
- أعد تعيين كلمة المرور من Supabase

### خطأ: "SSL required"
**الحل:** الكود مضبوط على SSL افتراضياً، لكن تأكد من أن Supabase SSL مفعل

## خطوات التحقق النهائية

1. ✅ `DATABASE_URL` موجود في Vercel
2. ✅ `SESSION_SECRET` موجود في Vercel
3. ✅ Connection String صحيح
4. ✅ تم إعادة النشر بعد إضافة المتغيرات
5. ✅ Supabase database يعمل
6. ✅ كلمة المرور صحيحة

## إذا استمرت المشكلة

1. **تحقق من Vercel Logs بالتفصيل**
2. **اختبر الاتصال محلياً**
3. **تحقق من Supabase Database Status**
4. **أعد تعيين كلمة المرور وجرب مرة أخرى**

