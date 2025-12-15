# إصلاح DATABASE_URL - Fix DATABASE_URL

## المشكلة - Problem

`DATABASE_URL` في ملف `.env` يستخدم منفذ 5432 (Direct connection) بدلاً من 6543 (Connection Pooler).

**الخطأ:**
```
Error: getaddrinfo ENOTFOUND db.ganuizvmmozagyzotohx.supabase.co
```

## الحل - Solution

يجب استخدام **Connection Pooler** على منفذ **6543** بدلاً من Direct connection على منفذ 5432.

### الخطوات - Steps

1. افتح Supabase Dashboard
2. اذهب إلى Project Settings → Database
3. انسخ **Connection Pooler** connection string (port 6543)
4. استبدل `DATABASE_URL` في ملف `.env`

### التنسيق الصحيح - Correct Format

```
DATABASE_URL=postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**ملاحظات:**
- استخدم `pooler.supabase.com` وليس `db.supabase.co`
- استخدم port `6543` وليس `5432`
- استخدم `postgres.ganuizvmmozagyzotohx` وليس `postgres`

## التحقق - Verification

بعد تحديث `DATABASE_URL`، شغّل:

```bash
node test-db-connection.js
```

يجب أن ترى:
```
✅ Database connection successful!
```

---

## Fix DATABASE_URL

### Problem

`DATABASE_URL` in `.env` file uses port 5432 (Direct connection) instead of 6543 (Connection Pooler).

**Error:**
```
Error: getaddrinfo ENOTFOUND db.ganuizvmmozagyzotohx.supabase.co
```

### Solution

Use **Connection Pooler** on port **6543** instead of Direct connection on port 5432.

### Steps

1. Open Supabase Dashboard
2. Go to Project Settings → Database
3. Copy **Connection Pooler** connection string (port 6543)
4. Replace `DATABASE_URL` in `.env` file

### Correct Format

```
DATABASE_URL=postgresql://postgres.ganuizvmmozagyzotohx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Notes:**
- Use `pooler.supabase.com` not `db.supabase.co`
- Use port `6543` not `5432`
- Use `postgres.ganuizvmmozagyzotohx` not `postgres`

## Verification

After updating `DATABASE_URL`, run:

```bash
node test-db-connection.js
```

You should see:
```
✅ Database connection successful!
```

