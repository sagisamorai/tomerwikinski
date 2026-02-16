# GROUPCONSULT - אתר שיווקי + פאנל ניהול

## סקירה

אתר שיווקי לקבוצת ייעוץ (אסטרטגיה, ניהול, הון) עם פאנל ניהול מלא בעברית.

### Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS
- **Backend:** Express.js + Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** Clerk (Sign in, RBAC: Admin/Editor)
- **Validation:** Zod

---

## התקנה והרצה

### דרישות מקדימות

- Node.js 18+
- חשבון [Clerk](https://clerk.com)

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת משתני סביבה

ערוך `.env.local`:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # מ-Clerk Dashboard
CLERK_SECRET_KEY=sk_test_...             # מ-Clerk Dashboard
SERVER_PORT=3006
```

צור `.env` (עבור Prisma):

```
DATABASE_URL="file:./dev.db"
```

### 3. יצירת מסד הנתונים

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. הרצה

```bash
npm run dev
```

- אתר ציבורי: http://localhost:3005
- פאנל ניהול: http://localhost:3005/#/admin

---

## הגדרת Clerk

1. צור Application ב-[Clerk Dashboard](https://dashboard.clerk.com)
2. העתק Publishable key ו-Secret key ל-`.env.local`
3. להגדרת RBAC: לך ל-Users > בחר משתמש > Metadata > הוסף `publicMetadata`:
   ```json
   { "role": "admin" }
   ```
   (ברירת מחדל: `editor`)

### הרשאות

| תפקיד | יכולות |
|--------|--------|
| **Admin** | CRUD מלא + מחיקה + יומן פעולות |
| **Editor** | יצירה + עריכה + קריאה (ללא מחיקת ישויות רגישות) |

---

## מבנה הפרויקט

```
├── admin/              # פאנל ניהול (React)
│   ├── components/     # רכיבי UI
│   ├── pages/          # דפי ניהול CRUD
│   └── hooks/          # Custom hooks
├── server/             # שרת Express
│   ├── routes/         # API endpoints
│   ├── middleware/      # Auth + RBAC
│   └── lib/            # Prisma + Audit
├── prisma/             # סכימה + seed
├── components/         # רכיבי אתר ציבורי
├── pages/              # דפי אתר ציבורי
└── uploads/            # קבצים שהועלו
```

---

## מסכי ניהול

| מסך | נתיב | תיאור |
|------|------|--------|
| דשבורד | `/admin` | סטטיסטיקות + פעילות אחרונה |
| דפים | `/admin/pages` | CRUD דפים דינמיים (SEO, טיוטה/פרסום) |
| שירותים | `/admin/services` | CRUD שירותים (סדר, סטטוס, אייקון) |
| קטגוריות | `/admin/categories` | CRUD קטגוריות (slug, סדר, סטטוס) |
| ספריית מדיה | `/admin/media` | העלאה/מחיקה של תמונות, עריכת alt |
| המלצות | `/admin/testimonials` | CRUD המלצות לקוחות |
| שאלות נפוצות | `/admin/faq` | CRUD שאלות ותשובות |
| פניות | `/admin/contacts` | צפייה/מחיקה של פניות מטופס יצירת קשר |
| הגדרות אתר | `/admin/settings` | עריכת טקסטים, פרטי קשר, SEO, מיתוג |
| יומן פעולות | `/admin/audit` | מי שינה מה ומתי (audit log) |

---

## API Endpoints

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET/POST | `/api/pages` | רשימה / יצירת דף |
| GET/PUT/DELETE | `/api/pages/:id` | קריאה / עדכון / מחיקה |
| GET/POST | `/api/services` | רשימה / יצירת שירות |
| GET/PUT/DELETE | `/api/services/:id` | קריאה / עדכון / מחיקה |
| GET | `/api/settings` | כל ההגדרות |
| PUT | `/api/settings/:id` | עדכון הגדרה |
| PUT | `/api/settings/bulk/update` | עדכון מרובה |
| GET/POST | `/api/categories` | רשימה / יצירה |
| GET/PUT/DELETE | `/api/categories/:id` | קריאה / עדכון / מחיקה |
| GET/POST | `/api/media` | רשימה / העלאת קובץ |
| GET/PUT/DELETE | `/api/media/:id` | קריאה / עדכון / מחיקה |
| GET | `/api/contacts` | רשימת פניות |
| POST | `/api/contacts/public` | שליחת פנייה (ציבורי) |
| PUT | `/api/contacts/:id/read` | סימון כנקראה |
| DELETE | `/api/contacts/:id` | מחיקה |
| GET/POST | `/api/testimonials` | רשימה / יצירה |
| GET/PUT/DELETE | `/api/testimonials/:id` | קריאה / עדכון / מחיקה |
| GET/POST | `/api/faq` | רשימה / יצירה |
| GET/PUT/DELETE | `/api/faq/:id` | קריאה / עדכון / מחיקה |
| GET | `/api/dashboard` | סטטיסטיקות דשבורד |
| GET | `/api/audit` | יומן פעולות |

---

## הוספת ישות חדשה

1. הוסף מודל ב-`prisma/schema.prisma`
2. הרץ `npx prisma db push`
3. צור route ב-`server/routes/`
4. רשום ב-`server/index.ts`
5. צור דפי CRUD ב-`admin/pages/`
6. הוסף routes ב-`admin/AdminApp.tsx`
7. הוסף קישור ב-`admin/components/Sidebar.tsx`
