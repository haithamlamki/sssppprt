# قيم Environment Variables المطلوبة في Vercel
# Required Environment Variables Values for Vercel

## 📋 القيم المطلوبة - Required Values

### 1. DATABASE_URL

**القيمة المطلوبة - Required Value:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**كيفية الحصول عليها - How to Get It:**
1. افتح Supabase Dashboard: https://supabase.com/dashboard
2. اختر المشروع: `ganuizvmmozagyzotohx`
3. اذهب إلى: Settings → Database
4. اختر Connection Pooler (Session mode)
5. انسخ Connection String (port 6543)
6. استبدل `[YOUR-PASSWORD]` بكلمة المرور الفعلية

**ملاحظات مهمة - Important Notes:**
- ✅ يجب استخدام Connection Pooler (port 6543)
- ❌ لا تستخدم Direct connection (port 5432)
- ✅ Format: `pooler.supabase.com:6543`

---

### 2. SESSION_SECRET

**القيمة المولدة - Generated Value:**
```
djDQsolpppQioelHgQsMtP1LEME38RgWvadpKwPSXHs=
```

**كيفية إنشائه - How to Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**ملاحظات مهمة - Important Notes:**
- يجب أن يكون عشوائياً وقوياً
- لا تستخدم نفس القيمة في Development و Production
- لا تشارك SESSION_SECRET مع أي شخص

---

## 📝 خطوات الإضافة في Vercel - Steps to Add in Vercel

### الخطوة 1: فتح Vercel Dashboard
1. افتح: https://vercel.com/dashboard
2. اختر المشروع: `abraj-sport-2025`
3. اضغط **Settings** (الإعدادات)
4. اضغط **Environment Variables** من القائمة الجانبية

### الخطوة 2: إضافة/تحديث DATABASE_URL
1. ابحث عن `DATABASE_URL` في القائمة
2. إذا كان موجوداً:
   - اضغط **"Edit"**
   - تحقق من أنه يستخدم Connection Pooler (port 6543)
   - إذا لم يكن كذلك، استبدله بالقيمة الصحيحة
3. إذا لم يكن موجوداً:
   - اضغط **"Add New"**
   - Key: `DATABASE_URL`
   - Value: الصق Connection String الكامل
4. Environment:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. اضغط **"Save"**

### الخطوة 3: إضافة SESSION_SECRET
1. اضغط **"Add New"**
2. Key: `SESSION_SECRET`
3. Value: `djDQsolpppQioelHgQsMtP1LEME38RgWvadpKwPSXHs=`
4. Environment:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. اضغط **"Save"**

---

## ✅ قائمة التحقق - Checklist

### قبل النشر - Before Deployment
- [ ] `DATABASE_URL` موجود في Vercel ويستخدم Connection Pooler (port 6543)
- [ ] `SESSION_SECRET` موجود في Vercel
- [ ] Environment Variables مضبوطة لجميع البيئات (Production, Preview, Development)

### بعد النشر - After Deployment
- [ ] Build نجح في Vercel
- [ ] Runtime Logs تظهر `Database connection successful`
- [ ] الصفحة الرئيسية تعمل
- [ ] تسجيل الدخول يعمل
- [ ] البيانات تظهر بشكل صحيح

---

## 🔍 كيفية التحقق - How to Verify

### من Vercel Dashboard:
1. اذهب إلى: https://vercel.com/dashboard
2. اختر المشروع: `abraj-sport-2025`
3. اضغط **Settings** → **Environment Variables**
4. ستجد جميع المتغيرات المضافة

### من Vercel CLI:
```bash
vercel env ls
```

---

## ⚠️ تحذيرات - Warnings

1. **DATABASE_URL**:
   - ❌ لا تستخدم Direct connection (port 5432) - سيسبب أخطاء في Vercel
   - ✅ استخدم Connection Pooler (port 6543) دائماً

2. **SESSION_SECRET**:
   - ❌ لا تستخدم نفس القيمة في Development و Production
   - ✅ استخدم قيم مختلفة لكل بيئة (أو على الأقل Production مختلفة)

3. **Environment Variables**:
   - بعد إضافة/تحديث Environment Variables، يجب إعادة النشر
   - Vercel قد يحتاج بضع دقائق لتطبيق التغييرات

