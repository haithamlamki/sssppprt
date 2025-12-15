# إعداد قاعدة البيانات في Vercel

## المشكلة
قاعدة البيانات غير متصلة - خطأ 500 عند تسجيل الدخول.

## الحل: إضافة متغيرات البيئة في Vercel

### الخطوة 1: الحصول على DATABASE_URL من Supabase

1. **افتح Supabase Dashboard**
   - اذهب إلى: https://supabase.com/dashboard
   - اختر مشروعك

2. **احصل على Connection String**
   - اذهب إلى **Settings** → **Database**
   - ابحث عن **Connection string** أو **Connection pooling**
   - اختر **URI** format
   - انسخ Connection string

3. **الصيغة المطلوبة:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

   **مثال:**
   ```
   postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

### الخطوة 2: إضافة متغيرات البيئة في Vercel

1. **افتح Vercel Dashboard**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروع `abraj-sport-2025`

2. **اذهب إلى Environment Variables**
   - اضغط على **Settings** (الإعدادات)
   - اضغط على **Environment Variables** من القائمة الجانبية

3. **أضف DATABASE_URL**
   - اضغط **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: الصق Connection string من Supabase
   - **Environment**: اختر **Production**, **Preview**, و **Development**
   - اضغط **"Save"**

4. **أضف SESSION_SECRET**
   - اضغط **"Add New"** مرة أخرى
   - **Name**: `SESSION_SECRET`
   - **Value**: أنشئ مفتاح عشوائي (انظر أدناه)
   - **Environment**: اختر **Production**, **Preview**, و **Development**
   - اضغط **"Save"**

### الخطوة 3: إنشاء SESSION_SECRET

**في Terminal المحلي:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**أو استخدم هذا المفتاح (لكن يُفضل إنشاء واحد جديد):**
```
f0iCSaaTypc9kHkw/K+lft2mR/frvNAiZeACKqxpIn4=
```

### الخطوة 4: إعادة النشر

بعد إضافة متغيرات البيئة:

1. **إعادة النشر التلقائي**
   - Vercel سيعيد النشر تلقائياً بعد إضافة متغيرات البيئة
   - أو اذهب إلى **Deployments** → اضغط **"Redeploy"**

2. **التحقق**
   - انتظر حتى يكتمل البناء (1-2 دقيقة)
   - جرب تسجيل الدخول مرة أخرى

## التحقق من الاتصال

### طريقة 1: من Vercel Logs
1. اذهب إلى **Deployments**
2. اختر آخر deployment
3. اضغط على **"Functions"** tab
4. اضغط على `/api/index`
5. تحقق من **Logs** - يجب ألا ترى أخطاء قاعدة البيانات

### طريقة 2: من Supabase Dashboard
1. اذهب إلى **Database** → **Connection Pooling**
2. تحقق من **Active connections**
3. يجب أن ترى اتصالات نشطة من Vercel

## استكشاف الأخطاء

### خطأ: "DATABASE_URL must be set"
- **الحل**: تأكد من إضافة `DATABASE_URL` في Vercel Environment Variables

### خطأ: "Invalid DATABASE_URL format"
- **الحل**: تأكد من أن الصيغة صحيحة:
  ```
  postgresql://user:password@host:port/database
  ```

### خطأ: "Connection timeout"
- **الحل**: 
  - تحقق من أن Supabase database يعمل
  - تحقق من أن IP addresses مسموح بها في Supabase
  - Vercel IPs مسموح بها افتراضياً

### خطأ: "SSL required"
- **الحل**: الكود مضبوط على SSL افتراضياً، لكن تأكد من أن Supabase SSL مفعل

## ملاحظات مهمة

1. **لا تشارك DATABASE_URL** - هذا مفتاح حساس
2. **استخدم Connection Pooling** من Supabase للأداء الأفضل
3. **SESSION_SECRET** يجب أن يكون عشوائياً وقوياً
4. **أعد النشر** بعد إضافة متغيرات البيئة

## مثال كامل لـ DATABASE_URL

```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**ملاحظة**: استخدم **Connection Pooler** من Supabase للأداء الأفضل في Vercel.

