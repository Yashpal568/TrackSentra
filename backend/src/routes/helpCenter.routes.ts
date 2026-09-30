import { Router } from 'express';
import { 
  getPublicArticles, 
  getPublicArticleBySlug, 
  getAdminArticles, 
  createAdminArticle, 
  updateAdminArticle, 
  deleteAdminArticle 
} from '../controllers/helpCenter.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole as authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public / Authed Customer Endpoints (can be public or just authed)
router.get('/articles', authenticate, getPublicArticles);
router.get('/articles/:slug', authenticate, getPublicArticleBySlug);

// Admin Endpoints
router.get('/admin/articles', authenticate, authorize([UserRole.SUPER_ADMIN]), getAdminArticles);
router.post('/admin/articles', authenticate, authorize([UserRole.SUPER_ADMIN]), createAdminArticle);
router.put('/admin/articles/:id', authenticate, authorize([UserRole.SUPER_ADMIN]), updateAdminArticle);
router.delete('/admin/articles/:id', authenticate, authorize([UserRole.SUPER_ADMIN]), deleteAdminArticle);

export default router;
