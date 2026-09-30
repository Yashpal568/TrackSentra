import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { Site } from '../models/Site';
import { Guard } from '../models/Guard';
import { Checkpoint } from '../models/Checkpoint';
import { Shift } from '../models/Shift';

export const getOnboardingStatus = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const companyId = user.companyId;

  const [company, siteCount, guardCount, checkpointCount, shiftCount] = await Promise.all([
    Company.findById(companyId).select('settings.onboarding name address contactEmail contactPhone').lean(),
    Site.countDocuments({ companyId }),
    Guard.countDocuments({ companyId }),
    Checkpoint.countDocuments({ companyId }),
    Shift.countDocuments({ companyId })
  ]);

  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }

  // Profile is complete if basic contact details exist
  const isProfileComplete = !!(company.address && company.contactEmail && company.contactPhone);

  const status = {
    dismissed: company.settings?.onboarding?.dismissed || false,
    steps: {
      profile_completed: isProfileComplete,
      site_created: siteCount > 0,
      guard_added: guardCount > 0,
      checkpoint_created: checkpointCount > 0,
      patrol_scheduled: shiftCount > 0
    },
    // Overall completion true if all required steps are true
    isComplete: isProfileComplete && siteCount > 0 && guardCount > 0 && checkpointCount > 0 && shiftCount > 0
  };

  res.json(status);
};

export const dismissOnboarding = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const companyId = user.companyId;

  await Company.findByIdAndUpdate(companyId, {
    $set: { 'settings.onboarding.dismissed': true }
  });

  res.json({ success: true });
};
