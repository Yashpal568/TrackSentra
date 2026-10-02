import { Request, Response, NextFunction } from 'express';
import { Subscription, SubscriptionStatus } from '../models/Subscription';
import { UserRole } from '../models/User';

export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;

  // Super admins bypass subscription checks
  if (user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Only apply to state-changing operations to allow read-only access to expired accounts
  if (req.method === 'GET') {
    return next();
  }

  try {
    const subscription = await Subscription.findOne({ companyId: user.companyId });
    
    // If no subscription exists, or it's not active/past_due, deny access
    // Note: Some systems allow PAST_DUE a grace period. For strictness, we require ACTIVE.
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      res.status(402).json({ 
        error: { 
          message: 'Payment Required: Your subscription is not active. Please update your billing information.',
          code: 'SUBSCRIPTION_INACTIVE'
        } 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription Check Error:', error);
    res.status(500).json({ error: { message: 'Internal server error during subscription validation' } });
  }
};
