# إصلاح مشكلة ملفات Server في Vercel

## المشكلة
- ملفات `server/` و `shared/` موجودة في Git ✅
- لكن Vercel لا يجدها عند النشر
- خطأ: `ERR_MODULE_NOT_FOUND` أو `Cannot find module '../server/routes'`

## الحل المطبق

### 1. إضافة `includeFiles` في vercel.json
تم إضافة:
```json
"includeFiles": "server/**"
```

هذا يضمن نسخ جميع ملفات `server/` إلى Vercel function.

### 2. التحقق من ملفات shared/
ملفات `shared/` موجودة في Git:
- `shared/schema.ts` ✅

Vercel ينسخ جميع الملفات من repository تلقائياً، لذا `shared/` يجب أن يكون متاحاً.

### 3. إذا استمرت المشكلة

#### الحل البديل 1: نسخ ملفات server إلى api/
```bash
# إنشاء symlinks أو نسخ الملفات
cp -r server api/server
cp -r shared api/shared
```

#### الحل البديل 2: استخدام bundler
بناء ملفات server إلى ملف واحد:
```json
"buildCommand": "npm run build && npm run build:server"
```

#### الحل البديل 3: تعديل imports في api/index.ts
استخدام absolute imports بدلاً من relative:
```typescript
import { registerRoutes } from '@/server/routes';
```

## التحقق

بعد إعادة النشر:
1. تحقق من Vercel Logs
2. ابحث عن أخطاء `MODULE_NOT_FOUND`
3. تحقق من أن ملفات server موجودة في function directory

## ملاحظات

- `includeFiles` يجب أن يكون string وليس array
- Vercel ينسخ الملفات من repository root
- TypeScript files يتم transpile تلقائياً بواسطة Vercel

