import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const [
      pagesCount,
      publishedPagesCount,
      servicesCount,
      categoriesCount,
      mediaCount,
      unreadContactsCount,
      testimonialsCount,
      faqCount,
      recentActivity,
    ] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }),
      prisma.page.count({ where: { deletedAt: null, status: 'published' } }),
      prisma.service.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.mediaAsset.count({ where: { deletedAt: null } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.testimonial.count({ where: { deletedAt: null } }),
      prisma.fAQ.count({ where: { deletedAt: null } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    res.json({
      stats: {
        pages: pagesCount,
        publishedPages: publishedPagesCount,
        services: servicesCount,
        categories: categoriesCount,
        media: mediaCount,
        unreadContacts: unreadContactsCount,
        testimonials: testimonialsCount,
        faq: faqCount,
      },
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הדשבורד' });
  }
});

export default router;
