import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { SystemSettings } from '../models/SystemSettings';
import { UserRole } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Subscription, SubscriptionStatus } from '../models/Subscription';
import { PaymentSubmission, PaymentStatus } from '../models/PaymentSubmission';

// --------------------------------------------------------------------------
// PUBLIC PRICING & PLANS
// --------------------------------------------------------------------------

export const getPublishedPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find({ visibility: 'public' }).sort({ order: 1 });
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// --------------------------------------------------------------------------
// SUPER ADMIN PLAN MANAGEMENT
// --------------------------------------------------------------------------

export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }
    const plans = await Plan.find().sort({ order: 1 });
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { name, description, price, currency, billingInterval, trialDurationDays, features, limits, visibility, order } = req.body;
    
    if (price < 0 || limits.maxGuards < 1 || limits.maxSites < 1) {
      res.status(400).json({ error: { message: 'Invalid pricing or limits' } });
      return;
    }

    const plan = await Plan.create({
      name, description, price, currency, billingInterval, trialDurationDays, features, limits, visibility, order
    });

    await AuditLog.create({
      userId: user._id,
      action: 'CREATE_PLAN',
      resource: 'Plan',
      details: { planId: plan._id }
    });

    res.status(201).json({ plan });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { price, limits } = req.body;
    if (price !== undefined && price < 0) { res.status(400).json({ error: { message: 'Invalid pricing' } }); return; }
    if (limits && (limits.maxGuards < 1 || limits.maxSites < 1)) { res.status(400).json({ error: { message: 'Invalid limits' } }); return; }

    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) { res.status(404).json({ error: { message: 'Plan not found' } }); return; }

    await AuditLog.create({
      userId: user._id,
      action: 'UPDATE_PLAN',
      resource: 'Plan',
      details: { planId: plan._id }
    });

    res.json({ plan });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) { res.status(404).json({ error: { message: 'Plan not found' } }); return; }

    await AuditLog.create({
      userId: user._id,
      action: 'DELETE_PLAN',
      resource: 'Plan',
      details: { planId: plan._id }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// --------------------------------------------------------------------------
// SYSTEM SETTINGS (MANUAL PAYMENT INFO)
// --------------------------------------------------------------------------

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SystemSettings.findById('global_settings');
    if (!settings) {
      settings = await SystemSettings.create({ _id: 'global_settings', manualPaymentInstructions: {} });
    }
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { manualPaymentInstructions } = req.body;
    let settings = await SystemSettings.findById('global_settings');
    if (!settings) {
      settings = new SystemSettings({ _id: 'global_settings' });
    }
    settings.manualPaymentInstructions = manualPaymentInstructions;
    await settings.save();

    await AuditLog.create({
      userId: user._id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      resource: 'SystemSettings',
    });

    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// --------------------------------------------------------------------------
// CUSTOMER SUBSCRIPTION & PAYMENT SUBMISSION
// --------------------------------------------------------------------------

export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user.companyId) { res.status(400).json({ error: { message: 'No company associated' } }); return; }

    const subscription = await Subscription.findOne({ companyId: user.companyId }).populate('planId');
    res.json({ subscription });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const submitPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.COMPANY_ADMIN) {
      res.status(403).json({ error: { message: 'Only company admin can submit payments' } });
      return;
    }

    const { planId, transactionReference, paymentDate, evidenceUrl } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) { res.status(404).json({ error: { message: 'Plan not found' } }); return; }

    // Check if subscription exists
    let subscription = await Subscription.findOne({ companyId: user.companyId });
    if (!subscription) {
      subscription = await Subscription.create({
        companyId: user.companyId,
        planId: plan._id,
        status: SubscriptionStatus.PENDING_PAYMENT,
        planSnapshot: {
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          limits: plan.limits
        }
      });
    }

    const existingSubmission = await PaymentSubmission.findOne({ transactionReference });
    if (existingSubmission) {
      res.status(400).json({ error: { message: 'Transaction reference already submitted' } });
      return;
    }

    const submission = await PaymentSubmission.create({
      companyId: user.companyId,
      subscriptionId: subscription._id,
      submitterId: user._id,
      expectedAmount: plan.price,
      currency: plan.currency,
      transactionReference,
      paymentDate,
      evidenceUrl
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'SUBMIT_PAYMENT',
      resource: 'PaymentSubmission',
      details: { submissionId: submission._id }
    });

    res.status(201).json({ submission, subscription });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// --------------------------------------------------------------------------
// SUPER ADMIN PAYMENT VERIFICATION
// --------------------------------------------------------------------------

export const getPaymentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }
    
    // In production, we'd add pagination and filtering here
    const submissions = await PaymentSubmission.find()
      .populate('companyId', 'name')
      .populate('subscriptionId')
      .populate('submitterId', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
    res.json({ submissions });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { status, rejectionReason } = req.body;
    if (![PaymentStatus.APPROVED, PaymentStatus.REJECTED].includes(status)) {
      res.status(400).json({ error: { message: 'Invalid status' } });
      return;
    }

    if (status === PaymentStatus.REJECTED && !rejectionReason) {
      res.status(400).json({ error: { message: 'Rejection reason is required' } });
      return;
    }

    // Atomic transaction for verification
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const submission = await PaymentSubmission.findById(req.params.id).session(session);
      if (!submission) {
        throw new Error('Payment submission not found');
      }
      if (submission.status !== PaymentStatus.PENDING) {
        throw new Error('Payment already processed');
      }

      submission.status = status;
      submission.reviewerId = user._id;
      submission.reviewedAt = new Date();
      if (rejectionReason) submission.rejectionReason = rejectionReason;
      
      await submission.save({ session });

      const subscription = await Subscription.findById(submission.subscriptionId).session(session);
      if (!subscription) throw new Error('Subscription not found');

      if (status === PaymentStatus.APPROVED) {
        subscription.status = SubscriptionStatus.ACTIVE;
        const now = new Date();
        subscription.startDate = subscription.startDate || now;
        subscription.currentPeriodStart = now;
        
        // Calculate period end
        const end = new Date(now);
        switch (subscription.planSnapshot.billingInterval) {
          case 'monthly': end.setMonth(end.getMonth() + 1); break;
          case 'quarterly': end.setMonth(end.getMonth() + 3); break;
          case 'half-yearly': end.setMonth(end.getMonth() + 6); break;
          case 'annual': end.setFullYear(end.getFullYear() + 1); break;
        }
        subscription.currentPeriodEnd = end;
        await subscription.save({ session });
      }

      await AuditLog.create([{
        userId: user._id,
        action: `PAYMENT_${status}`,
        resource: 'PaymentSubmission',
        details: { submissionId: submission._id }
      }], { session });

      await session.commitTransaction();
      res.json({ submission, subscription });
    } catch (err: any) {
      await session.abortTransaction();
      res.status(400).json({ error: { message: err.message } });
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};
