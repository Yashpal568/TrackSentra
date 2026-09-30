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

    // Demo user write protection
    if (user.isDemoUser && req.method !== 'GET' && !req.originalUrl.includes('/auth/demo') && !req.originalUrl.includes('/auth/logout')) {
      res.status(403).json({ error: { message: 'Write operations are disabled in demo mode.' } });
      return;
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid or expired token' } });
    return;
  }
};


