import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { getLangFromQuery, localizeRecord } from '../lib/localize.js';
import { z } from 'zod';

const router = Router();

const pageSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  title_en: z.string().optional().nullable(),
  title_pt: z.string().optional().nullable(),
  slug: z.string().min(1, 'Slug הוא שדה חובה').regex(/^[a-z0-9-]+$/, 'Slug יכול להכיל רק אותיות קטנות באנגלית, מספרים ומקפים'),
  content: z.string().optional().default(''),
  content_en: z.string().optional().nullable(),
  content_pt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaTitle_en: z.string().optional().nullable(),
  metaTitle_pt: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaDescription_en: z.string().optional().nullable(),
  metaDescription_pt: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

// GET /api/pages/public/:slug - public endpoint to fetch a published page by slug (no auth)
router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const lang = getLangFromQuery(req.query);
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, status: 'published', deletedAt: null },
    });
    if (!page) { res.status(404).json({ error: 'הדף לא נמצא' }); return; }
    const localized = localizeRecord(page, ['title', 'content', 'metaTitle', 'metaDescription'], lang);
    res.json(localized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הדף' });
  }
});

// GET /api/pages/public - list all published pages (no auth), for navigation
router.get('/public', async (req: Request, res: Response) => {
  try {
    const lang = getLangFromQuery(req.query);
    const pages = await prisma.page.findMany({
      where: { status: 'published', deletedAt: null },
      select: { slug: true, title: true, title_en: true, title_pt: true, metaTitle: true, metaTitle_en: true, metaTitle_pt: true },
      orderBy: { updatedAt: 'desc' },
    });
    const localized = pages.map((p) => localizeRecord(p, ['title', 'metaTitle'], lang));
    res.json(localized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הדפים' });
  }
});

// GET /api/pages - list all pages (admin)
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const pages = await prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הדפים' });
  }
});

// GET /api/pages/:id - get single page
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const page = await prisma.page.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!page) { res.status(404).json({ error: 'הדף לא נמצא' }); return; }
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הדף' });
  }
});

// POST /api/pages - create page
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = pageSchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const page = await prisma.page.create({
      data: { ...data, createdBy: userId, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'create', entityType: 'page', entityId: page.id, entityName: page.title });
    res.status(201).json(page);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה ביצירת הדף' });
  }
});

// PUT /api/pages/:id - update page
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = pageSchema.partial().parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: { ...data, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'page', entityId: page.id, entityName: page.title });
    res.json(page);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2002') { res.status(400).json({ error: 'Slug כבר קיים במערכת' }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הדף לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון הדף' });
  }
});

// DELETE /api/pages/:id - soft delete page
router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { userId, userName, role } = getUserInfo(req);
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await logAudit({ userId, userName, userRole: role, action: 'delete', entityType: 'page', entityId: page.id, entityName: page.title });
    res.json({ message: 'הדף נמחק בהצלחה' });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'הדף לא נמצא' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת הדף' });
  }
});

export default router;
