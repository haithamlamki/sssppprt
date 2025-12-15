# تعليمات إعادة النشر على Vercel

## المشكلة
Vercel ما زال يستخدم commit قديم (4816af8) بدلاً من آخر commit (40caf99) الذي يحتوي على الإصلاح.

## الحل: إعادة النشر يدوياً

### الطريقة 1: من Vercel Dashboard

1. **افتح Vercel Dashboard**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروع `abraj-sport-2025`

2. **إعادة النشر**
   - اذهب إلى تبويب **"Deployments"**
   - اضغط على **"..."** (ثلاث نقاط) بجانب آخر deployment
   - اختر **"Redeploy"**
   - **مهم**: تأكد من إلغاء تفعيل **"Use existing Build Cache"** (أو اتركه فارغاً)
   - اضغط **"Redeploy"**

3. **الانتظار**
   - انتظر حتى يكتمل البناء (عادة 1-2 دقيقة)
   - تحقق من Build Logs للتأكد من نجاح البناء

### الطريقة 2: من GitHub (إجبار Vercel على إعادة البناء)

1. **إنشاء commit فارغ**
   ```bash
   git commit --allow-empty -m "Trigger Vercel rebuild"
   git push origin main
   ```

2. **Vercel سيكتشف التغيير تلقائياً**
   - سيبدأ بناء جديد تلقائياً
   - سيستخدم آخر commit (40caf99)

### الطريقة 3: من Vercel CLI

```bash
vercel --prod --force
```

## التحقق من آخر Commit

آخر commit على GitHub يجب أن يكون:
- **Commit Hash**: `40caf99`
- **Message**: "Fix: Close DynamicGridColumns tag correctly in league-detail.tsx"

للتحقق:
```bash
git log --oneline -1
```

## إذا استمرت المشكلة

1. تحقق من أن آخر commit موجود على GitHub
2. تأكد من أن Vercel متصل بـ GitHub repository الصحيح
3. جرب حذف Build Cache في Vercel Settings
4. تحقق من أن Branch في Vercel مضبوط على `main`

