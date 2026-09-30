import mongoose from 'mongoose';
import { Subscription, SubscriptionStatus } from '../models/Subscription';

export const checkResourceLimit = async (
  companyId: mongoose.Types.ObjectId,
  resourceType: 'guards' | 'sites',
  currentCount: number
): Promise<{ allowed: boolean; reason?: string }> => {
  const subscription = await Subscription.findOne({ companyId, status: SubscriptionStatus.ACTIVE });
  
  if (!subscription) {
    return { allowed: false, reason: 'Active subscription required to provision resources.' };
  }

  const limits = subscription.planSnapshot.limits;
  
  if (resourceType === 'guards' && currentCount >= limits.maxGuards) {
    return { allowed: false, reason: `Plan limit reached: Maximum ${limits.maxGuards} guards allowed.` };
  }
  
  if (resourceType === 'sites' && currentCount >= limits.maxSites) {
    return { allowed: false, reason: `Plan limit reached: Maximum ${limits.maxSites} sites allowed.` };
  }

  return { allowed: true };
};
