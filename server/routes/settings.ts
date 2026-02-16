import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/audit.js';
import { requireAuth, getUserInfo } from '../middleware/auth.js';
import { getLangFromQuery, localizeField } from '../lib/localize.js';
import { z } from 'zod';

const router = Router();

const settingUpdateSchema = z.object({
  value: z.string(),
});

// GET /api/settings/public - public site settings (no auth), supports ?lang=en|pt
router.get('/public', async (req: Request, res: Response) => {
  try {
    const lang = getLangFromQuery(req.query);
    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = localizeField(s, 'value', lang);
    });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת ההגדרות' });
  }
});

// GET /api/settings - list all settings (admin, returns all lang fields)
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת ההגדרות' });
  }
});

// GET /api/settings/group/:group
router.get('/group/:group', requireAuth, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { group: req.params.group },
      orderBy: { order: 'asc' },
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת ההגדרות' });
  }
});

// PUT /api/settings/:id
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = settingUpdateSchema.parse(req.body);
    const { userId, userName, role } = getUserInfo(req);
    const setting = await prisma.siteSetting.update({
      where: { id: req.params.id },
      data: { value: data.value, updatedBy: userId },
    });
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'setting', entityId: setting.id, entityName: setting.label });
    res.json(setting);
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'ההגדרה לא נמצאה' }); return; }
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון ההגדרה' });
  }
});

// PUT /api/settings/bulk/update - supports value, value_en, value_pt
router.put('/bulk/update', requireAuth, async (req: Request, res: Response) => {
  try {
    const updates: { id: string; value: string; value_en?: string; value_pt?: string }[] = req.body.settings;
    const { userId, userName, role } = getUserInfo(req);
    for (const update of updates) {
      const data: any = { value: update.value, updatedBy: userId };
      if (update.value_en !== undefined) data.value_en = update.value_en;
      if (update.value_pt !== undefined) data.value_pt = update.value_pt;
      await prisma.siteSetting.update({
        where: { id: update.id },
        data,
      });
    }
    await logAudit({ userId, userName, userRole: role, action: 'update', entityType: 'setting', entityId: 'bulk', entityName: 'עדכון הגדרות' });
    res.json({ message: 'ההגדרות עודכנו בהצלחה' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון ההגדרות' });
  }
});

export default router;
