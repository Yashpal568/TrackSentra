import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: { message: 'Authentication required' } });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string, companyId?: string };
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user || user.status !== 'active') {
      res.status(401).json({ error: { message: 'Invalid or inactive user' } });
      return;
    }

    if (user.companyId) {
      const { Company } = await import('../models/Company');
      const company = await Company.findById(user.companyId);
      if (company && company.status === 'suspended') {
        res.status(403).json({ error: { message: 'Your company account has been suspended by the administrator.' } });
        return;
      }
    }

    // Demo user write protection (disabled for testing)
    // if (user.isDemoUser && req.method !== 'GET' && !req.originalUrl.includes('/auth/demo') && !req.originalUrl.includes('/auth/logout')) {
    //   res.status(403).json({ error: { message: 'Write operations are disabled in demo mode.' } });
    //   return;
    // }

    if ((decoded as any).impersonating) {
      user.role = (decoded as any).role;
      user.companyId = (decoded as any).companyId;
      (user as any).isImpersonating = true;
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid or expired token' } });
    return;
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user || user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: { message: 'Super Admin access required' } });
    return;
  }
  next();
};

