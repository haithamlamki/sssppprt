# إصلاح مشكلة MODULE_NOT_FOUND في Vercel

## المشكلة

من Vercel Logs:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/api/server/routes' 
imported from /var/task/api/index.js
```

## السبب

1. ملفات `api/server/` و `api/shared/` كانت مستبعدة من Git في `.gitignore`
2. Vercel لا يرى الملفات التي لا توجد في Git repository
3. حتى لو تم نسخ الملفات أثناء build، Vercel لا يراها في runtime

## الحل المطبق

### 1. إزالة api/server و api/shared من .gitignore

تم تحديث `.gitignore`:
```diff
- # Copied server files for Vercel (generated during build)
- api/server
- api/shared
+ # Copied server files for Vercel (generated during build)
+ # Note: api/server and api/shared are now tracked in Git to ensure they're available in Vercel runtime
```

### 2. إضافة الملفات إلى Git

```bash
git add api/server api/shared
git commit -m "Add api/server and api/shared to Git"
```

### 3. إضافة includeFiles في vercel.json

تم إضافة `includeFiles` في function config:
```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "includeFiles": "api/server/**,api/shared/**"
    }
  }
}
```

## كيف يعمل الآن

1. **قبل Build**: `copy-server-files.js` ينسخ `server/` و `shared/` إلى `api/`
2. **في Git**: ملفات `api/server/` و `api/shared/` موجودة في repository
3. **في Vercel**: الملفات متاحة في runtime لأنها موجودة في Git
4. **includeFiles**: يضمن تضمين الملفات في deployment

## صيانة الملفات

### تحديث ملفات api/server و api/shared

عند تعديل ملفات في `server/` أو `shared/`:

1. **شغّل copy script**:
   ```bash
   npm run copy-server-files
   ```

2. **تحقق من التغييرات**:
   ```bash
   git status api/server api/shared
   ```

3. **أضف و commit**:
   ```bash
   git add api/server api/shared
   git commit -m "Update api/server and api/shared"
   ```

### قبل كل commit

يُنصح بتشغيل `copy-server-files.js` قبل commit للتأكد من أن `api/server/` و `api/shared/` محدثة:

```bash
npm run copy-server-files
git add api/server api/shared
git commit -m "Your commit message"
```

## التحقق من الحل

بعد إعادة النشر على Vercel:

1. **تحقق من Build Logs**:
   - يجب أن ترى: `✓ Copied server/ to api/server/`
   - يجب أن ترى: `✓ Copied shared/ to api/shared/`

2. **تحقق من Runtime Logs**:
   - يجب أن ترى: `📄 server/routes.ts exists: true`
   - يجب أن ترى: `📄 server/storage.ts exists: true`
   - يجب أن ترى: `📄 shared/schema.ts exists: true`

3. **تحقق من عدم وجود أخطاء**:
   - لا يجب أن ترى: `ERR_MODULE_NOT_FOUND`
   - يجب أن ترى: `✅ Database connection successful`

## ملاحظات مهمة

- ✅ ملفات `api/server/` و `api/shared/` موجودة الآن في Git
- ✅ `includeFiles` في `vercel.json` يضمن تضمين الملفات
- ✅ `copy-server-files.js` يعمل قبل كل build
- ⚠️ يجب تحديث `api/server/` و `api/shared/` بعد تعديل `server/` أو `shared/`

## إذا استمرت المشكلة

1. **تحقق من Build Logs**:
   - هل `copy-server-files.js` يعمل؟
   - هل الملفات تُنسخ بنجاح؟

2. **تحقق من Git**:
   - هل `api/server/` و `api/shared/` موجودة في repository؟
   - هل الملفات محدثة؟

3. **تحقق من vercel.json**:
   - هل `includeFiles` موجود؟
   - هل الصيغة صحيحة؟

4. **تحقق من Runtime Logs**:
   - ما هي رسائل الخطأ الجديدة؟
   - هل الملفات موجودة في `/var/task/api/server/`؟

