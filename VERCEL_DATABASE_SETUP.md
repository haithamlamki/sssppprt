# إعداد قاعدة البيانات في Vercel - دليل مفصل

## ⚠️ مشكلة IPv4 Compatibility

إذا رأيت تحذير "Not IPv4 compatible" في Supabase، استخدم **Connection Pooler** بدلاً من Direct connection.

## الخطوات التفصيلية

### 1. الحصول على DATABASE_URL من Supabase

#### أ. افتح Supabase Dashboard
- اذهب إلى: https://supabase.com/dashboard
- اختر مشروعك (`ganuizvmmozagyzotohx`)

#### ب. اذهب إلى Connection String
- اضغط **Settings** (الإعدادات)
- اضغط **Database** من القائمة الجانبية
- ابحث عن **Connection string** أو **Connection pooling**

#### ج. اختر الإعدادات الصحيحة
1. **Type**: اختر **"URI"**
2. **Source**: يمكنك اختيار **"Primary Database"** أو **"Connection Pooler"**
3. **Method**: **مهم جداً** - اختر **"Connection Pooler"** أو **"Session mode"**
   - ❌ **لا تستخدم** "Direct connection" (port 5432)
   - ✅ **استخدم** "Connection Pooler" (port 6543)

#### د. انسخ Connection String
الصيغة ستكون مثل:
```
postgresql://postgres.ganuizvmmozagyzotohx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**الفرق:**
- **Direct connection**: `db.ganuizvmmozagyzotohx.supabase.co:5432` ❌
- **Connection Pooler**: `aws-0-us-east-1.pooler.supabase.com:6543` ✅

### 2. استبدل [YOUR-PASSWORD]

1. إذا نسيت كلمة المرور:
   - اذهب إلى **Settings** → **Database**
   - اضغط **"Reset database password"**
   - انسخ كلمة المرور الجديدة

2. استبدل `[YOUR-PASSWORD]` في Connection String بكلمة المرور الفعلية

**مثال:**
```
postgresql://postgres.ganuizvmmozagyzotohx:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 3. أضف DATABASE_URL في Vercel

1. **افتح Vercel Dashboard**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروع `abraj-sport-2025`

2. **اذهب إلى Environment Variables**
   - اضغط **Settings** (الإعدادات)
   - اضغط **Environment Variables** من القائمة الجانبية

3. **أضف DATABASE_URL**
   - اضغط **"Add New"**
   - **Key**: `DATABASE_URL`
   - **Value**: الصق Connection String الكامل (مع كلمة المرور)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - اضغط **"Save"**

### 4. أضف SESSION_SECRET

1. في نفس الصفحة، اضغط **"Add New"**
2. **Key**: `SESSION_SECRET`
3. **Value**: أنشئ مفتاح عشوائي:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   أو استخدم:
   ```
   f0iCSaaTypc9kHkw/K+lft2mR/frvNAiZeACKqxpIn4=
   ```
4. **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. اضغط **"Save"**

### 5. إعادة النشر

1. اذهب إلى **Deployments**
2. اضغط **"..."** (ثلاث نقاط) بجانب آخر deployment
3. اختر **"Redeploy"**
4. **مهم**: تأكد من إلغاء تفعيل **"Use existing Build Cache"** (أو اتركه فارغاً)
5. اضغط **"Redeploy"**
6. انتظر 1-2 دقيقة حتى يكتمل البناء

### 6. التحقق

1. افتح الموقع بعد إعادة النشر
2. جرب تسجيل الدخول
3. يجب أن يعمل الآن! ✅

## استكشاف الأخطاء

### خطأ: "Not IPv4 compatible"
**الحل**: استخدم **Connection Pooler** بدلاً من Direct connection

### خطأ: "Connection timeout"
**الحل**: 
- تحقق من أن Connection Pooler مفعل
- تأكد من استخدام port 6543 وليس 5432

### خطأ: "Invalid DATABASE_URL format"
**الحل**: تأكد من الصيغة:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres
```

### خطأ: "Authentication failed"
**الحل**: 
- تحقق من كلمة المرور
- أعد تعيين كلمة المرور من Supabase Settings

## مثال كامل

**DATABASE_URL:**
```
postgresql://postgres.ganuizvmmozagyzotohx:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**SESSION_SECRET:**
```
f0iCSaaTypc9kHkw/K+lft2mR/frvNAiZeACKqxpIn4=
```

## ملاحظات أمنية

- ⚠️ **لا تشارك DATABASE_URL** - هذا مفتاح حساس
- ⚠️ **لا ترفع .env إلى GitHub** - استخدم Vercel Environment Variables فقط
- ✅ استخدم **Connection Pooler** للأداء الأفضل
- ✅ استخدم **SESSION_SECRET** قوي وعشوائي

