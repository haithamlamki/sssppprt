# خطوات النشر على Vercel - Deployment Steps

## ✅ الخطوات المكتملة

### 1. التحقق من Build Process
- ✅ `npm run build` يعمل محلياً بدون أخطاء
- ✅ `dist/public/index.html` موجود
- ✅ `api/server/` و `api/shared/` موجودة بعد نسخ الملفات

### 2. التحقق من Server Files Copy
- ✅ `scripts/copy-server-files.js` ينسخ الملفات بشكل صحيح
- ✅ جميع الملفات الحرجة موجودة

## 📋 الخطوات المتبقية

### 3. الحصول على Supabase Connection String

**المعلومات المتوفرة:**
- Project URL: https://ganuizvmmozagyzotohx.supabase.co
- Connection Pooler موجود في Vercel بالفعل (من ENVIRONMENT_VARIABLES.md)

**Connection String المطلوب:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**الخطوات:**
1. افتح Supabase Dashboard: https://supabase.com/dashboard
2. اختر المشروع: `ganuizvmmozagyzotohx`
3. اذهب إلى: Settings → Database
4. اختر Connection Pooler (Session mode)
5. انسخ Connection String (port 6543)

### 4. إعداد Vercel Environment Variables

#### 4.1 التحقق من DATABASE_URL في Vercel
1. افتح Vercel Dashboard: https://vercel.com/dashboard
2. اختر المشروع: `abraj-sport-2025`
3. اذهب إلى: Settings → Environment Variables
4. تحقق من وجود `DATABASE_URL`:
   - يجب أن يستخدم Connection Pooler (port 6543)
   - Format: `postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
5. إذا لم يكن موجوداً أو يحتاج تحديث:
   - اضغط "Edit" أو "Add New"
   - الصق Connection String
   - اختر Production, Preview, Development
   - احفظ

#### 4.2 إضافة SESSION_SECRET في Vercel
1. في نفس الصفحة، اضغط "Add New"
2. Key: `SESSION_SECRET`
3. Value: أنشئ مفتاح عشوائي:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
4. Environment: Production, Preview, Development
5. احفظ

### 5. التحقق من Build Configuration

#### 5.1 التحقق من vercel.json
- ✅ `buildCommand`: `node scripts/copy-server-files.js && npm run build`
- ✅ `outputDirectory`: `dist/public`
- ✅ `rewrites`: صحيح (API routes + SPA routing)
- ✅ `functions`: `api/index.ts` مع `includeFiles`

#### 5.2 التحقق من package.json
- ✅ `build` script: `vite build && npm run copy-server-files`
- ✅ `@vercel/node` في dependencies
- ✅ `serverless-http` في dependencies

### 6. النشر على Vercel

#### الطريقة 1: عبر GitHub (مستحسن)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```
Vercel سينشر تلقائياً بعد push.

#### الطريقة 2: عبر Vercel CLI
```bash
vercel --prod
```

### 7. التحقق من النشر

#### 7.1 Build Logs
- افتح Vercel Dashboard → Deployments
- تحقق من:
  - ✅ `npm run build` نجح
  - ✅ `copy-server-files.js` نجح
  - ✅ `dist/public` تم إنشاؤه

#### 7.2 Runtime Logs
- افتح Function Logs في Vercel
- ابحث عن:
  - ✅ `Database connection successful`
  - ✅ `server/routes.ts exists: true`
  - ❌ أي أخطاء `ERR_MODULE_NOT_FOUND`

#### 7.3 اختبار الموقع
- افتح URL المنشور
- اختبر:
  - الصفحة الرئيسية تعمل
  - تسجيل الدخول يعمل
  - API endpoints تعمل
  - البيانات تظهر

---

## Deployment Steps

## ✅ Completed Steps

### 1. Verify Build Process
- ✅ `npm run build` works locally without errors
- ✅ `dist/public/index.html` exists
- ✅ `api/server/` and `api/shared/` exist after file copy

### 2. Verify Server Files Copy
- ✅ `scripts/copy-server-files.js` copies files correctly
- ✅ All critical files exist

## 📋 Remaining Steps

### 3. Get Supabase Connection String

**Available Information:**
- Project URL: https://ganuizvmmozagyzotohx.supabase.co
- Connection Pooler already exists in Vercel (from ENVIRONMENT_VARIABLES.md)

**Required Connection String:**
```
postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Steps:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `ganuizvmmozagyzotohx`
3. Go to: Settings → Database
4. Select Connection Pooler (Session mode)
5. Copy Connection String (port 6543)

### 4. Setup Vercel Environment Variables

#### 4.1 Verify DATABASE_URL in Vercel
1. Open Vercel Dashboard: https://vercel.com/dashboard
2. Select project: `abraj-sport-2025`
3. Go to: Settings → Environment Variables
4. Check if `DATABASE_URL` exists:
   - Should use Connection Pooler (port 6543)
   - Format: `postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
5. If not exists or needs update:
   - Click "Edit" or "Add New"
   - Paste Connection String
   - Select Production, Preview, Development
   - Save

#### 4.2 Add SESSION_SECRET in Vercel
1. On same page, click "Add New"
2. Key: `SESSION_SECRET`
3. Value: Generate random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
4. Environment: Production, Preview, Development
5. Save

### 5. Verify Build Configuration

#### 5.1 Verify vercel.json
- ✅ `buildCommand`: `node scripts/copy-server-files.js && npm run build`
- ✅ `outputDirectory`: `dist/public`
- ✅ `rewrites`: correct (API routes + SPA routing)
- ✅ `functions`: `api/index.ts` with `includeFiles`

#### 5.2 Verify package.json
- ✅ `build` script: `vite build && npm run copy-server-files`
- ✅ `@vercel/node` in dependencies
- ✅ `serverless-http` in dependencies

### 6. Deploy to Vercel

#### Method 1: Via GitHub (Recommended)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```
Vercel will deploy automatically after push.

#### Method 2: Via Vercel CLI
```bash
vercel --prod
```

### 7. Verify Deployment

#### 7.1 Build Logs
- Open Vercel Dashboard → Deployments
- Check:
  - ✅ `npm run build` succeeded
  - ✅ `copy-server-files.js` succeeded
  - ✅ `dist/public` created

#### 7.2 Runtime Logs
- Open Function Logs in Vercel
- Look for:
  - ✅ `Database connection successful`
  - ✅ `server/routes.ts exists: true`
  - ❌ Any `ERR_MODULE_NOT_FOUND` errors

#### 7.3 Test Site
- Open deployed URL
- Test:
  - Homepage works
  - Login works
  - API endpoints work
  - Data displays correctly

