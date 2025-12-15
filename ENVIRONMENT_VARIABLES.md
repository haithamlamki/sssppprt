# Environment Variables - متغيرات البيئة

## Environment Variables في المشروع

### 📁 Local Development (.env file)

**الملف:** `.env` في المجلد الرئيسي

**المتغيرات المطلوبة:**

```bash
# Database Connection (PostgreSQL/Supabase)
DATABASE_URL=postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Session Secret (for authentication)
SESSION_SECRET=abraj-sports-committee-secret-2025-change-in-production

# Server Port (optional, defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=development

# Optional: Neon Database (if using)
NEON_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-wispy-art-afd7ti2b.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

### ☁️ Vercel Production/Preview/Development

**المكان:** Vercel Dashboard → Project Settings → Environment Variables

**المتغيرات المطلوبة:**

#### 1. DATABASE_URL ✅ (موجود - لكن يحتاج تحديث)

**القيمة الحالية في Vercel:**
```
postgresql://postgres.ganuizvmmozagyzotohx:i16xenZZfX5Rz6zo@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**الحالة:** ✅ صحيح - يستخدم Connection Pooler (port 6543)

**ملاحظة:** من الصورة، يبدو أنك تحاول إضافة `DATABASE_URL` مرة أخرى، لكنه موجود بالفعل. إذا كنت تريد تحديثه:
1. ابحث عن `DATABASE_URL` في القائمة
2. اضغط على "Edit" أو "Update"
3. استبدل القيمة القديمة بالقيمة الجديدة
4. احفظ

#### 2. SESSION_SECRET (مطلوب)

**القيمة المطلوبة:**
```
[Random 32-byte base64 string]
```

**كيفية إنشائه:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**مثال:**
```
abraj-sports-committee-secret-2025-change-in-production
```

#### 3. NODE_ENV (اختياري - Vercel يضيفه تلقائياً)

**القيمة:**
```
production
```

---

## 📋 قائمة التحقق - Checklist

### Local Development (.env)
- [x] `DATABASE_URL` - موجود (لكن يحتاج تحديث لاستخدام Connection Pooler)
- [x] `SESSION_SECRET` - موجود
- [x] `PORT` - موجود (3000)
- [x] `NODE_ENV` - موجود (development)
- [ ] `NEON_DATABASE_URL` - موجود (اختياري)

### Vercel Environment Variables
- [x] `DATABASE_URL` - موجود ✅
- [ ] `SESSION_SECRET` - **يجب التحقق من وجوده**
- [ ] `NODE_ENV` - Vercel يضيفه تلقائياً

---

## 🔍 كيفية التحقق من Environment Variables في Vercel

### من Vercel Dashboard:
1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك: `abraj-sport-2025`
3. اضغط **Settings** (الإعدادات)
4. اضغط **Environment Variables** من القائمة الجانبية
5. ستجد جميع المتغيرات المضافة

### من Vercel CLI:
```bash
vercel env ls
```

---

## ⚠️ ملاحظات مهمة

### 1. DATABASE_URL
- ✅ **يجب استخدام Connection Pooler** (port 6543) وليس Direct connection (port 5432)
- ✅ **الصيغة الصحيحة:** `postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
- ❌ **الصيغة الخاطئة:** `postgresql://postgres:[PASSWORD]@db.ganuizvmmozagyzotohx.supabase.co:5432/postgres`

### 2. SESSION_SECRET
- يجب أن يكون **عشوائياً** و **قوياً**
- لا تستخدم نفس القيمة في Development و Production
- لا تشارك SESSION_SECRET مع أي شخص

### 3. Environment-Specific Variables
- في Vercel، يمكنك تعيين قيم مختلفة لكل بيئة:
  - **Production** - للنسخة النهائية
  - **Preview** - للـ Pull Requests
  - **Development** - للتطوير

---

## 🔧 كيفية تحديث Environment Variable في Vercel

### إذا كان المتغير موجود بالفعل (مثل DATABASE_URL):

1. اذهب إلى Vercel Dashboard → Project Settings → Environment Variables
2. ابحث عن المتغير في القائمة (مثل `DATABASE_URL`)
3. اضغط على **"Edit"** أو **"Update"** بجانب المتغير
4. استبدل القيمة القديمة بالقيمة الجديدة
5. اضغط **"Save"**

### إذا كان المتغير غير موجود:

1. اذهب إلى Vercel Dashboard → Project Settings → Environment Variables
2. اضغط **"Add New"**
3. أدخل:
   - **Key**: اسم المتغير (مثل `SESSION_SECRET`)
   - **Value**: قيمة المتغير
   - **Environment**: اختر Production, Preview, Development
4. اضغط **"Save"**

---

## 📝 ملخص Environment Variables

| Variable | Local (.env) | Vercel | Required | Status |
|----------|--------------|--------|----------|--------|
| `DATABASE_URL` | ✅ موجود | ✅ موجود | ✅ نعم | ⚠️ يحتاج تحديث في .env |
| `SESSION_SECRET` | ✅ موجود | ❓ غير مؤكد | ✅ نعم | ⚠️ يجب التحقق |
| `PORT` | ✅ موجود | ❌ غير مطلوب | ❌ لا | ✅ جيد |
| `NODE_ENV` | ✅ موجود | ✅ تلقائي | ❌ لا | ✅ جيد |
| `NEON_DATABASE_URL` | ✅ موجود | ❌ غير مطلوب | ❌ لا | ✅ جيد |

---

## Environment Variables in Project

### 📁 Local Development (.env file)

**File:** `.env` in root directory

**Required Variables:**

```bash
# Database Connection (PostgreSQL/Supabase)
DATABASE_URL=postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Session Secret (for authentication)
SESSION_SECRET=abraj-sports-committee-secret-2025-change-in-production

# Server Port (optional, defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=development

# Optional: Neon Database (if using)
NEON_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-wispy-art-afd7ti2b.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

### ☁️ Vercel Production/Preview/Development

**Location:** Vercel Dashboard → Project Settings → Environment Variables

**Required Variables:**

#### 1. DATABASE_URL ✅ (exists - but may need update)

**Current value in Vercel:**
```
postgresql://postgres.ganuizvmmozagyzotohx:i16xenZZfX5Rz6zo@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Status:** ✅ Correct - uses Connection Pooler (port 6543)

**Note:** From the image, it seems you're trying to add `DATABASE_URL` again, but it already exists. If you want to update it:
1. Find `DATABASE_URL` in the list
2. Click "Edit" or "Update"
3. Replace the old value with the new value
4. Save

#### 2. SESSION_SECRET (required)

**Required value:**
```
[Random 32-byte base64 string]
```

**How to generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```
abraj-sports-committee-secret-2025-change-in-production
```

#### 3. NODE_ENV (optional - Vercel adds it automatically)

**Value:**
```
production
```

---

## 📋 Checklist

### Local Development (.env)
- [x] `DATABASE_URL` - exists (but needs update to use Connection Pooler)
- [x] `SESSION_SECRET` - exists
- [x] `PORT` - exists (3000)
- [x] `NODE_ENV` - exists (development)
- [ ] `NEON_DATABASE_URL` - exists (optional)

### Vercel Environment Variables
- [x] `DATABASE_URL` - exists ✅
- [ ] `SESSION_SECRET` - **must verify it exists**
- [ ] `NODE_ENV` - Vercel adds it automatically

---

## 🔍 How to Check Environment Variables in Vercel

### From Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project: `abraj-sport-2025`
3. Click **Settings**
4. Click **Environment Variables** from sidebar
5. You'll see all added variables

### From Vercel CLI:
```bash
vercel env ls
```

---

## ⚠️ Important Notes

### 1. DATABASE_URL
- ✅ **Must use Connection Pooler** (port 6543) not Direct connection (port 5432)
- ✅ **Correct format:** `postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
- ❌ **Wrong format:** `postgresql://postgres:[PASSWORD]@db.ganuizvmmozagyzotohx.supabase.co:5432/postgres`

### 2. SESSION_SECRET
- Must be **random** and **strong**
- Don't use the same value in Development and Production
- Don't share SESSION_SECRET with anyone

### 3. Environment-Specific Variables
- In Vercel, you can set different values for each environment:
  - **Production** - for final version
  - **Preview** - for Pull Requests
  - **Development** - for development

---

## 🔧 How to Update Environment Variable in Vercel

### If variable already exists (like DATABASE_URL):

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Find the variable in the list (like `DATABASE_URL`)
3. Click **"Edit"** or **"Update"** next to the variable
4. Replace the old value with the new value
5. Click **"Save"**

### If variable doesn't exist:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Click **"Add New"**
3. Enter:
   - **Key**: Variable name (like `SESSION_SECRET`)
   - **Value**: Variable value
   - **Environment**: Select Production, Preview, Development
4. Click **"Save"**

---

## 📝 Environment Variables Summary

| Variable | Local (.env) | Vercel | Required | Status |
|----------|--------------|--------|----------|--------|
| `DATABASE_URL` | ✅ exists | ✅ exists | ✅ yes | ⚠️ needs update in .env |
| `SESSION_SECRET` | ✅ exists | ❓ unknown | ✅ yes | ⚠️ must verify |
| `PORT` | ✅ exists | ❌ not required | ❌ no | ✅ good |
| `NODE_ENV` | ✅ exists | ✅ automatic | ❌ no | ✅ good |
| `NEON_DATABASE_URL` | ✅ exists | ❌ not required | ❌ no | ✅ good |

