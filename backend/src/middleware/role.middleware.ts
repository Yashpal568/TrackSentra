import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ error: { message: 'Authentication required' } });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ error: { message: 'Forbidden: Insufficient role permissions' } });
      return;
    }

    next();
  };
};
