# إصلاح مشكلة عرض كود TypeScript في Vercel

## المشكلة
عند النشر على Vercel، يظهر كود TypeScript بدلاً من التطبيق.

## الحل

### 1. تأكد من أن البناء يتم بشكل صحيح
```bash
npm run build
```

يجب أن ينتج مجلد `dist/public` يحتوي على:
- `index.html`
- `assets/` (ملفات JS و CSS)

### 2. تحقق من vercel.json
يجب أن يكون `outputDirectory` مضبوط على `dist/public`

### 3. تحقق من متغيرات البيئة في Vercel
- اذهب إلى Vercel Dashboard → Project Settings → Environment Variables
- تأكد من وجود:
  - `DATABASE_URL`
  - `SESSION_SECRET`

### 4. إعادة النشر
بعد التعديلات، أعد النشر:
```bash
git add .
git commit -m "Fix Vercel deployment"
git push
```

أو من Vercel Dashboard:
- اذهب إلى Deployments
- اضغط على "Redeploy"

## ملاحظات مهمة

1. **الملفات الثابتة**: Vercel يخدم الملفات من `dist/public` تلقائياً
2. **API Routes**: جميع طلبات `/api/*` تذهب إلى `/api/index.ts`
3. **SPA Routing**: جميع الطلبات الأخرى تذهب إلى `index.html`

## إذا استمرت المشكلة

1. تحقق من Build Logs في Vercel Dashboard
2. تأكد من أن `npm run build` يعمل محلياً
3. تحقق من أن `dist/public/index.html` موجود بعد البناء

