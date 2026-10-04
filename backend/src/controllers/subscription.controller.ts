import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { SystemSettings } from '../models/SystemSettings';
import { UserRole } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Subscription, SubscriptionStatus } from '../models/Subscription';
import { PaymentSubmission, PaymentStatus } from '../models/PaymentSubmission';
import { SubscriptionHistory } from '../models/SubscriptionHistory';
import { NotificationService } from '../services/notification.service';
import { Company } from '../models/Company';

export const getPublishedPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find({ visibility: 'public' }).sort({ order: 1 });
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== UserRole.SUPER_ADMIN) { res.status(403).json({ error: { message: 'Forbidden' } }); return; }
    const plans = await Plan.find().sort({ order: 1 });
    res.json({ plans });
  } catch (error: any) { res.status(500).json({ error: { message: error.message } }); }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { name, description, pricing, currency, trialDurationDays, features, limits, visibility, order } = req.body;
    const plan = await Plan.create({ name, description, pricing, currency, trialDurationDays, features, limits, visibility, order });
    res.status(201).json({ plan });
  } catch (error: any) { res.status(400).json({ error: { message: error.message } }); }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ plan });
  } catch (error: any) { res.status(400).json({ error: { message: error.message } }); }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) { res.status(400).json({ error: { message: error.message } }); }
};

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SystemSettings.findById('global_settings');
    if (!settings) settings = await SystemSettings.create({ _id: 'global_settings', manualPaymentInstructions: {} });
    res.json({ settings });
  } catch (error: any) { res.status(500).json({ error: { message: error.message } }); }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { manualPaymentInstructions } = req.body;
    let settings = await SystemSettings.findById('global_settings');
    if (!settings) settings = new SystemSettings({ _id: 'global_settings' });
    settings.manualPaymentInstructions = manualPaymentInstructions;
    await settings.save();
    res.json({ settings });
  } catch (error: any) { res.status(500).json({ error: { message: error.message } }); }
};

export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const subscription = await Subscription.findOne({ companyId: user.companyId }).populate('planId').populate('nextPlanId');
    let hasPendingSubmission = false;
    let pendingPaymentData = null;
    
    if (subscription) {
      const pendingSub = await PaymentSubmission.findOne({ subscriptionId: subscription._id, status: 'PENDING' });
      if (pendingSub) {
        hasPendingSubmission = true;
        pendingPaymentData = pendingSub;
      }
    }

    res.json({ subscription, hasPendingSubmission, pendingPaymentData });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const selectPlan = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = (req as any).user;
    const { planId, billingInterval = 'monthly' } = req.body;
    const plan = await Plan.findById(planId).session(session);
    if (!plan) throw new Error('Plan not found');
    const newPrice = (plan as any).pricing[billingInterval];

    let subscription = await Subscription.findOne({ companyId: user.companyId }).session(session);
    
    if (subscription && (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)) {
      const currentPrice = subscription.planSnapshot.price || 0;
      
      if (newPrice > currentPrice) {
        let unusedCredit = 0;
        let prorationAmount = newPrice;
        if (subscription.currentPeriodStart && subscription.currentPeriodEnd) {
          const totalDays = (subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime()) / (1000 * 3600 * 24);
          const remainingDays = (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 3600 * 24);
          if (remainingDays > 0 && totalDays > 0) {
            unusedCredit = Math.floor(currentPrice * (remainingDays / totalDays));
            const proratedNewPrice = Math.floor(newPrice * (remainingDays / totalDays));
            prorationAmount = Math.max(0, proratedNewPrice - unusedCredit);
          }
        }
        
        res.json({
          message: 'Upgrade requested',
          isUpgrade: true,
          prorationAmount,
          unusedCredit,
          targetPlanId: plan._id,
          targetBillingInterval: billingInterval,
          fullPrice: newPrice
        });
        await session.commitTransaction();
        return;

      } else if (newPrice < currentPrice) {
        subscription.nextPlanId = plan._id as any;
        subscription.nextBillingInterval = billingInterval;
        await subscription.save({ session });
        
        await SubscriptionHistory.create([{
          companyId: user.companyId,
          subscriptionId: subscription._id,
          eventType: 'DOWNGRADE_SCHEDULED',
          details: { toPlanId: plan._id }
        }], { session });

        res.json({ message: 'Downgrade scheduled for end of billing period', subscription });
        await session.commitTransaction();
        return;
      }
    } 
    
    if (!subscription) {
      subscription = new Subscription({
        companyId: user.companyId,
        planId: plan._id,
        status: SubscriptionStatus.PENDING_PAYMENT,
        planSnapshot: { name: plan.name, price: newPrice, currency: plan.currency, billingInterval, limits: plan.limits }
      });
    } else {
      subscription.planId = plan._id as any;
      subscription.status = SubscriptionStatus.PENDING_PAYMENT;
      subscription.planSnapshot = { name: plan.name, price: newPrice, currency: plan.currency, billingInterval, limits: plan.limits };
    }
    
    await subscription.save({ session });
    await session.commitTransaction();
    res.json({ message: 'Plan selected', subscription });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ error: { message: error.message } });
  } finally {
    session.endSession();
  }
};

export const submitPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { planId, transactionReference, paymentDate, expectedAmount, targetBillingInterval, isUpgrade, prorationCredit } = req.body;

    let subscription = await Subscription.findOne({ companyId: user.companyId });
    if (!subscription) throw new Error('Subscription not found');

    const existingSubmission = await PaymentSubmission.findOne({ transactionReference });
    if (existingSubmission) throw new Error('Transaction reference already submitted');

    const submission = await PaymentSubmission.create({
      companyId: user.companyId,
      subscriptionId: subscription._id,
      submitterId: user._id,
      expectedAmount: expectedAmount || subscription.planSnapshot.price,
      currency: 'INR',
      transactionReference,
      paymentDate,
      targetPlanId: planId,
      targetBillingInterval,
      isUpgrade,
      prorationCredit
    });

    res.status(201).json({ submission, subscription });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const subscription = await Subscription.findOne({ companyId: user.companyId });
    if (!subscription) throw new Error('Subscription not found');
    
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    
    await SubscriptionHistory.create({
      companyId: user.companyId,
      subscriptionId: subscription._id,
      eventType: 'CANCELLATION_SCHEDULED',
      details: { effectiveDate: subscription.currentPeriodEnd }
    });
    
    res.json({ message: 'Subscription cancellation scheduled', subscription });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};

export const resumeSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const subscription = await Subscription.findOne({ companyId: user.companyId });
    if (!subscription) throw new Error('Subscription not found');
    
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    
    await SubscriptionHistory.create({
      companyId: user.companyId,
      subscriptionId: subscription._id,
      eventType: 'RESUMED',
      details: {}
    });
    
    res.json({ message: 'Subscription resumed', subscription });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};
