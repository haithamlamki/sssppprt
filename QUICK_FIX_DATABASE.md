# إصلاح سريع: قاعدة البيانات غير متصلة

## المشكلة
خطأ 500 عند تسجيل الدخول - قاعدة البيانات غير متصلة.

## الحل السريع (5 دقائق)

### 1. احصل على DATABASE_URL من Supabase

1. افتح: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **Settings** → **Database**
4. ابحث عن **Connection string**
5. **مهم**: اختر **Connection Pooler** بدلاً من **Direct connection**
   - في قائمة **Method**، اختر **"Connection Pooler"** أو **"Session mode"**
   - هذا مهم لأن Vercel يحتاج IPv4
6. اختر **URI** من قائمة **Type**
7. انسخ Connection string

**الصيغة ستكون مثل:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**ملاحظة مهمة:**
- استخدم **Connection Pooler** (port 6543) وليس Direct connection (port 5432)
- هذا يحل مشكلة IPv4 compatibility مع Vercel

### 2. أضف DATABASE_URL في Vercel

1. افتح: https://vercel.com/dashboard
2. اختر مشروع `abraj-sport-2025`
3. اضغط **Settings** → **Environment Variables**
4. اضغط **"Add New"**
5. أدخل:
   - **Key**: `DATABASE_URL`
   - **Value**: الصق Connection string من Supabase
   - **Environment**: اختر **Production**, **Preview**, **Development** (كلها)
6. اضغط **"Save"**

### 3. أضف SESSION_SECRET

1. في نفس الصفحة، اضغط **"Add New"** مرة أخرى
2. أدخل:
   - **Key**: `SESSION_SECRET`
   - **Value**: `f0iCSaaTypc9kHkw/K+lft2mR/frvNAiZeACKqxpIn4=`
   - **Environment**: اختر **Production**, **Preview**, **Development** (كلها)
3. اضغط **"Save"**

### 4. إعادة النشر

1. اذهب إلى **Deployments**
2. اضغط **"..."** بجانب آخر deployment
3. اختر **"Redeploy"**
4. انتظر 1-2 دقيقة

### 5. التحقق

1. افتح الموقع
2. جرب تسجيل الدخول
3. يجب أن يعمل الآن! ✅

## ملاحظات مهمة

- ⚠️ **لا تشارك DATABASE_URL** - هذا مفتاح حساس
- ✅ استخدم **Connection Pooler** من Supabase للأداء الأفضل
- ✅ تأكد من إضافة المتغيرات لجميع البيئات (Production, Preview, Development)

## إذا استمرت المشكلة

1. تحقق من Vercel Logs:
   - Deployments → آخر deployment → Functions → `/api/index` → Logs
2. تحقق من Supabase:
   - Database → Connection Pooling → Active connections
3. تأكد من أن Connection string صحيح

