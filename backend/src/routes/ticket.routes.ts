import { Router } from 'express';
import { 
  createTicket, 
  getCompanyTickets, 
  getTicketDetails, 
  replyToTicket,
  getAdminTickets,
  getAdminTicketDetails,
  updateAdminTicket,
  adminReplyToTicket
} from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole as authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

// Admin Endpoints
router.get('/admin', authorize([UserRole.SUPER_ADMIN]), getAdminTickets);
router.get('/admin/:id', authorize([UserRole.SUPER_ADMIN]), getAdminTicketDetails);
router.put('/admin/:id', authorize([UserRole.SUPER_ADMIN]), updateAdminTicket);
router.post('/admin/:id/replies', authorize([UserRole.SUPER_ADMIN]), adminReplyToTicket);

// Customer Endpoints
router.post('/', authorize([UserRole.COMPANY_ADMIN]), createTicket);
router.get('/', authorize([UserRole.COMPANY_ADMIN]), getCompanyTickets);
router.get('/:id', authorize([UserRole.COMPANY_ADMIN]), getTicketDetails);
router.post('/:id/replies', authorize([UserRole.COMPANY_ADMIN]), replyToTicket);

export default router;
