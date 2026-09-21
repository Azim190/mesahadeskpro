# دليل إعداد قاعدة البيانات المركزية السحابية / Cloud Database Setup Guide

لضمان عمل برنامج **مساحة ديسك برو (MesahaDesk Pro)** عبر أجهزة متعددة وتزامن كافة المستخدمين والمشاريع والعملاء دون فقدان أي بيانات، يتطلب النظام الاتصال بقاعدة بيانات مشتركة.

To ensure **MesahaDesk Pro** operates across multiple devices and synchronizes all users, projects, and clients without data loss, the system connects to a shared database.

---

## 🚀 الخيار الأول: استخدام قاعدة بيانات سحابية مجانية (موصى به - يستغرق دقيقتين)
## Option 1: Free Cloud PostgreSQL Database (Recommended - Takes 2 Minutes)

يمكنك الحصول على قاعدة بيانات PostgreSQL سحابية مجانية ودائمة 100% وتعمل من أي مكان في العالم عبر إحدى المنصتين:

You can get a free, permanent cloud PostgreSQL database accessible worldwide from either provider:

### أ) عبر منصة Neon (الأسرع والأسهل / Fastest & Simplest):
1. افتح الموقع: [https://neon.tech](https://neon.tech)
2. سجّل الدخول مجاناً بحساب Google أو GitHub.
3. انقر على **"Create Project"** وسمّ المشروع `masahadesk`.
4. انسخ رابط الاتصال **Connection String** الذي يظهر في لوحة التحكم، وسيكون بهذا الشكل:
   ```
   postgresql://neondb_owner:npg_xxxxxx@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. افتح ملف `apps/backend/.env` وألصق الرابط أمام `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_xxxxxx@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   DATABASE_SSL=true
   ```

### ب) عبر منصة Supabase:
1. افتح الموقع: [https://supabase.com](https://supabase.com)
2. أنشئ مشروعاً جديداً وضع كلمة مرور للقاعدة.
3. من صفحة **Project Settings -> Database -> Connection string (URI)**، انسخ الرابط وضع كلمة المرور فيه.
4. ألصقه في `apps/backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres.xxxx:your_password@aws-0-xxxx.pooler.supabase.com:6543/postgres?sslmode=require
   DATABASE_SSL=true
   ```

---

## 💻 ربط الأجهزة المختلفة بالتطبيق (Connecting Multiple Devices)

1. **على الجهاز الرئيسي (الذي يشغل الخادم):**
   - شغّل الخادم:
     ```bash
     npm run dev:backend
     ```
   - سيقوم الخادم تلقائياً بتهيئة كافة الجداول (`tenants`, `users`, `projects`, `clients`) وحساب المشرف الافتراضي (`maxpro190@gmail.com` / `Password123`).

2. **على أي جهاز كمبيوتر آخر:**
   - افتح تطبيق **مساحة ديسك برو**.
   - في شاشة تسجيل الدخول اضغط على زر **"إعدادات الخادم / Server & DB"** أسفل الشاشة.
   - اكتب رابط الخادم المشترك:
     - إذا كان الخادم مرفوعاً سحابياً (Railway/Render): `https://your-masaha-app.railway.app`
     - أو إذا كان في نفس شبكة المكتب المحلية: `http://192.168.1.X:3000` (حيث X هو رقم IP للجهاز الرئيسي).
   - اضغط **"فحص الاتصال / Test Connection"** للتأكد من ظهور علامة الاتصال باللون الأخضر.
   - اضغط **"حفظ وتطبيق / Save & Apply"**.
   - الآن يمكنك تسجيل الدخول بحساب المشرف أو أي مستخدم قمت بإضافته، وستظهر كافة المشاريع والبيانات فوراً!

---

## 💾 ميزة النسخ الاحتياطي اليدوي (Offline Backup & Restore)

في حال كنت تعمل بدون إنترنت أو ترغب في نقل البيانات فوراً بين جهازين دون إعداد شبكة:
1. اذهب إلى **الإعدادات العامة (General Settings)** من القائمة الجانبية.
2. انقر على **"تصدير نسخة احتياطية (JSON) / Export Full Backup"**.
3. انقل الملف لجهازك الآخر واضغط **"استيراد واسترجاع نسخة احتياطية / Import & Restore Backup"** لدمج كافة المشاريع والعملاء في ثوانٍ.
