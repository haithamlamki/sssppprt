# إعداد Environment Variables في Vercel - Vercel Environment Variables Setup

## 📋 قائمة التحقق - Checklist

### 1. DATABASE_URL ✅ (موجود - يحتاج التحقق)

**الموقع:** Vercel Dashboard → Project Settings → Environment Variables

**القيمة المطلوبة:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**الخطوات:**
1. افتح: https://vercel.com/dashboard
2. اختر المشروع: `abraj-sport-2025`
3. اذهب إلى: Settings → Environment Variables
4. ابحث عن `DATABASE_URL`
5. تحقق من:
   - ✅ يستخدم Connection Pooler (port 6543)
   - ✅ Format: `pooler.supabase.com:6543`
   - ✅ موجود لجميع البيئات (Production, Preview, Development)
6. إذا لم يكن موجوداً أو يحتاج تحديث:
   - اضغط "Edit" أو "Add New"
   - الصق Connection String من Supabase Dashboard
   - اختر Production, Preview, Development
   - احفظ

### 2. SESSION_SECRET ⚠️ (يحتاج إضافة)

**الموقع:** Vercel Dashboard → Project Settings → Environment Variables

**إنشاء SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**الخطوات:**
1. في نفس الصفحة (Environment Variables)
2. اضغط "Add New"
3. Key: `SESSION_SECRET`
4. Value: الصق القيمة المولدة من الأمر أعلاه
5. Environment: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. اضغط "Save"

---

## Environment Variables Setup

## 📋 Checklist

### 1. DATABASE_URL ✅ (Exists - Needs Verification)

**Location:** Vercel Dashboard → Project Settings → Environment Variables

**Required Value:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Steps:**
1. Open: https://vercel.com/dashboard
2. Select project: `abraj-sport-2025`
3. Go to: Settings → Environment Variables
4. Search for `DATABASE_URL`
5. Verify:
   - ✅ Uses Connection Pooler (port 6543)
   - ✅ Format: `pooler.supabase.com:6543`
   - ✅ Exists for all environments (Production, Preview, Development)
6. If not exists or needs update:
   - Click "Edit" or "Add New"
   - Paste Connection String from Supabase Dashboard
   - Select Production, Preview, Development
   - Save

### 2. SESSION_SECRET ⚠️ (Needs Addition)

**Location:** Vercel Dashboard → Project Settings → Environment Variables

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Steps:**
1. On same page (Environment Variables)
2. Click "Add New"
3. Key: `SESSION_SECRET`
4. Value: Paste value generated from command above
5. Environment:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click "Save"

---

## 🔍 كيفية التحقق - How to Verify

### من Vercel Dashboard:
1. اذهب إلى: https://vercel.com/dashboard
2. اختر المشروع: `abraj-sport-2025`
3. اضغط **Settings** (الإعدادات)
4. اضغط **Environment Variables** من القائمة الجانبية
5. ستجد جميع المتغيرات المضافة

### من Vercel CLI:
```bash
vercel env ls
```

---

## ⚠️ ملاحظات مهمة - Important Notes

1. **DATABASE_URL**:
   - ✅ يجب استخدام Connection Pooler (port 6543)
   - ❌ لا تستخدم Direct connection (port 5432)
   - Format: `postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

2. **SESSION_SECRET**:
   - يجب أن يكون عشوائياً وقوياً
   - لا تستخدم نفس القيمة في Development و Production
   - لا تشارك SESSION_SECRET مع أي شخص

3. **Environment-Specific Variables**:
   - في Vercel، يمكنك تعيين قيم مختلفة لكل بيئة:
     - **Production** - للنسخة النهائية
     - **Preview** - لـ Pull Requests
     - **Development** - للتطوير

