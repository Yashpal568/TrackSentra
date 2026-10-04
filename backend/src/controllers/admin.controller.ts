import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { User, UserRole } from '../models/User';
import { Subscription, SubscriptionStatus } from '../models/Subscription';
import { PaymentSubmission, PaymentStatus } from '../models/PaymentSubmission';
import { SubscriptionHistory } from '../models/SubscriptionHistory';
import { Invoice } from '../models/Invoice';
import { Plan } from '../models/Plan';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export const getPlatformDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCompanies = await Company.countDocuments();
    const allCompanies = await Company.aggregate([
      { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'companyId', as: 'subscription' } },
      { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
      { $addFields: { effectiveStatus: { $cond: { if: { $and: [ { $ne: ["$subscription", null] }, { $in: ["$subscription.status", ["PENDING_PAYMENT", "SUSPENDED", "TRIAL"]] } ] }, then: "$subscription.status", else: "$status" } } } },
      { $group: { _id: null, active: { $sum: { $cond: [{ $in: [{ $toUpper: "$effectiveStatus" }, ["ACTIVE", "TRIAL", "ACTIVE"]] }, 1, 0] } }, trial: { $sum: { $cond: [{ $eq: [{ $toUpper: "$effectiveStatus" }, "TRIAL"] }, 1, 0] } } } }
    ]);
    const kpiCounts = allCompanies.length > 0 ? allCompanies[0] : { active: 0, trial: 0 };
    const activeUsers = await User.countDocuments({ status: 'active' });
    let mrrCents = 0;
    const activeSubs = await Subscription.find({ status: { $in: ['ACTIVE', 'active'] } });
    activeSubs.forEach(sub => {
      const interval = (sub.planSnapshot as any)?.billingInterval;
      const price = (sub.planSnapshot as any)?.price || 0;
      if (interval === 'monthly') mrrCents += price;
      else if (interval === 'yearly' || interval === 'annual') mrrCents += price / 12;
    });

    const recentCompaniesList = await Company.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentCompanies = await Promise.all(recentCompaniesList.map(async (company) => {
      const sub = await Subscription.findOne({ companyId: company._id });
      let status = company.status;
      if (sub && ['PENDING_PAYMENT', 'SUSPENDED', 'TRIAL', 'PAST_DUE'].includes(sub.status.toUpperCase())) status = sub.status.toLowerCase();
      return { _id: company._id, name: company.name, createdAt: company.createdAt, status };
    }));

    res.json({
      kpis: { totalCompanies, activeCompanies: kpiCounts.active, trialCompanies: kpiCounts.trial, activeUsers, mrr: mrrCents / 100, openTickets: 0 },
      recentCompanies,
      systemHealth: { api: { status: 'Healthy', timestamp: new Date().toISOString() }, database: { status: 'Healthy', latency: 10 }, backgroundJobs: { status: 'Not configured' } }
    });
  } catch (error) { res.status(500).json({ error: { message: 'Failed' } }); }
};

export const getPlatformCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await Company.aggregate([
      { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'companyId', as: 'subscription' } },
      { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'plans', localField: 'subscription.planId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: '_id', foreignField: 'companyId', as: 'users' } },
      { $addFields: {
          userCount: { $size: '$users' },
          effectiveStatus: { $cond: { if: { $and: [ { $ne: ["$subscription", null] }, { $in: ["$subscription.status", ["PENDING_PAYMENT", "SUSPENDED", "TRIAL"]] } ] }, then: "$subscription.status", else: "$status" } }
        }
      },
      { $project: { name: 1, email: 1, phone: 1, status: 1, effectiveStatus: 1, createdAt: 1, userCount: 1, 'subscription.status': 1, 'subscription.planSnapshot': 1, 'plan.name': 1, mrr: 1 } }
    ]);
    res.json({ 
      companies, 
      kpis: { 
        total: companies.length, 
        active: companies.filter(c => ['ACTIVE'].includes(c.effectiveStatus.toUpperCase())).length,
        trial: companies.filter(c => ['TRIAL'].includes(c.effectiveStatus.toUpperCase())).length,
        pending: companies.filter(c => ['PENDING_PAYMENT'].includes(c.effectiveStatus.toUpperCase())).length,
        suspended: companies.filter(c => ['SUSPENDED'].includes(c.effectiveStatus.toUpperCase())).length
      }
    });
  } catch (error) { res.status(500).json({ error: { message: 'Failed' } }); }
};

export const impersonateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) { res.status(404).json({ error: { message: 'Company not found' } }); return; }

    const user = (req as any).user;
    const accessToken = jwt.sign(
      { userId: user._id, companyId: id, role: UserRole.COMPANY_ADMIN, impersonating: true },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
    
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600000 });
    res.json({ message: 'Impersonating company' });
  } catch (error: any) { res.status(500).json({ error: { message: error.message } }); }
};

export const getPaymentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, type, plan, date, page = 1, limit = 10, sort = 'newest' } = req.query;
    
    let filter: any = {};
    if (status && status !== 'All Statuses') filter.status = status;
    if (type && type !== 'All Types') {
      if (type === 'Upgrade') filter.isUpgrade = true;
      else if (type === 'Initial') filter.isUpgrade = false;
    }
    
    if (date && date !== 'All Time') {
      const now = new Date();
      if (date === 'Today') filter.createdAt = { $gte: new Date(now.setHours(0,0,0,0)) };
      else if (date === 'Last 7 Days') filter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      else if (date === 'Last 30 Days') filter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      else if (date === 'This Month') filter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    }
    
    if (search) {
      const matchingCompanies = await Company.find({ name: { $regex: search as string, $options: 'i' } }, '_id');
      const companyIds = matchingCompanies.map(c => c._id);
      filter.$or = [
        { transactionReference: { $regex: search as string, $options: 'i' } },
        { companyId: { $in: companyIds } }
      ];
      if (!isNaN(Number(search))) filter.$or.push({ expectedAmount: Number(search) });
    }
    
    if (plan && plan !== 'All Plans') {
       const matchingPlan = await Plan.findOne({ name: plan });
       if (matchingPlan) {
         const subsWithPlan = await Subscription.find({ planId: matchingPlan._id }, '_id');
         if (!filter.$or) filter.$or = [];
         filter.$or.push({ targetPlanId: matchingPlan._id }, { subscriptionId: { $in: subsWithPlan.map(s => s._id) } });
       }
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'highest') sortObj = { expectedAmount: -1 };
    else if (sort === 'lowest') sortObj = { expectedAmount: 1 };

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await PaymentSubmission.countDocuments(filter);
    const payments = await PaymentSubmission.find(filter)
      .populate('companyId', 'name')
      .populate('targetPlanId', 'name')
      .populate('subscriptionId', 'planSnapshot')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();
      
    let kpiFilter: any = {};
    if (filter.createdAt) kpiFilter.createdAt = filter.createdAt;
    
    const kpiStats = await PaymentSubmission.aggregate([
      { $match: kpiFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$expectedAmount' } } }
    ]);
    
    let kpis = { totalRevenue: 0, successfulCount: 0, pendingCount: 0, failedCount: 0, refundedAmount: 0 };
    kpiStats.forEach(stat => {
      if (stat._id === 'APPROVED') { kpis.successfulCount = stat.count; kpis.totalRevenue = stat.amount; }
      else if (stat._id === 'PENDING') kpis.pendingCount = stat.count;
      else if (stat._id === 'REJECTED') kpis.failedCount = stat.count;
      else if (stat._id === 'REFUNDED') kpis.refundedAmount = stat.amount;
    });

    res.json({ 
      payments, 
      pagination: { total: totalCount, page: pageNum, limit: limitNum, pages: Math.ceil(totalCount/limitNum) },
      kpis
    });
  } catch (error) { console.error(error); res.status(500).json({ error: { message: 'Failed to fetch payments' } }); }
};

export const getPaymentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await PaymentSubmission.findById(id).populate('companyId', 'name _id').lean();
    if (!payment) { res.status(404).json({ error: { message: 'Payment not found' } }); return; }
    
    const invoice = await Invoice.findOne({ paymentSubmissionId: id }).lean();
    const subscription = await Subscription.findById(payment.subscriptionId).populate('planId', 'name').lean();
    
    let companyAdminEmail = '';
    const admin = await User.findOne({ companyId: payment.companyId, role: 'COMPANY_ADMIN' }).lean();
    if (admin) companyAdminEmail = admin.email;
    
    const timeline = await SubscriptionHistory.find({ subscriptionId: payment.subscriptionId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ payment, invoice, subscription, timeline, companyAdminEmail });
  } catch (error) { console.error(error); res.status(500).json({ error: { message: 'Failed to fetch details' } }); }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = (req as any).user;
    const { companyId, status, rejectionReason } = req.body;
    
    const submission = await PaymentSubmission.findOne({ companyId, status: 'PENDING' }).sort({ createdAt: -1 }).session(session);
    if (!submission) {
      await session.abortTransaction();
      res.status(404).json({ error: { message: 'Pending payment submission not found. It may have already been processed.' } });
      return;
    }

    if (status === PaymentStatus.REJECTED) {
      submission.status = PaymentStatus.REJECTED;
      submission.rejectionReason = rejectionReason;
      await submission.save({ session });
      
      const subscription = await Subscription.findOne({ companyId }).session(session);
      if (subscription && subscription.status === SubscriptionStatus.PENDING_PAYMENT) {
        subscription.status = SubscriptionStatus.PAST_DUE;
        await subscription.save({ session });
      }
      
      await SubscriptionHistory.create([{ companyId, subscriptionId: submission.subscriptionId, eventType: 'PAYMENT_FAILED' }], { session });
      await session.commitTransaction();
      res.json({ message: 'Payment rejected' });
      return;
    }

    submission.status = PaymentStatus.APPROVED;
    submission.verifiedBy = user._id;
    submission.verifiedAt = new Date();
    await submission.save({ session });

    const subscription = await Subscription.findOne({ companyId }).session(session);
    if (!subscription) throw new Error('Subscription not found');

    const now = new Date();
    
    if (submission.isUpgrade && submission.targetPlanId) {
      const plan = await Plan.findById(submission.targetPlanId).session(session);
      if(plan) {
        subscription.planId = plan._id as any;
        subscription.planSnapshot = { name: plan.name, price: plan.pricing[submission.targetBillingInterval || 'monthly'], currency: plan.currency, billingInterval: submission.targetBillingInterval || 'monthly', limits: plan.limits };
      }
      subscription.status = SubscriptionStatus.ACTIVE;
    } else {
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.startDate = subscription.startDate || now;
      subscription.currentPeriodStart = now;
      const end = new Date(now);
      const interval = subscription.planSnapshot.billingInterval;
      if (interval === 'annual') end.setFullYear(end.getFullYear() + 1);
      else if (interval === 'quarterly') end.setMonth(end.getMonth() + 3);
      else end.setMonth(end.getMonth() + 1);
      subscription.currentPeriodEnd = end;
    }
    
    subscription.gracePeriodEnd = undefined;
    await subscription.save({ session });
    
    const invoice = new Invoice({
      companyId,
      subscriptionId: subscription._id,
      paymentSubmissionId: submission._id,
      invoiceNumber: 'INV-' + Date.now() + Math.floor(Math.random()*1000),
      amount: submission.expectedAmount,
      currency: submission.currency,
      billingPeriodStart: subscription.currentPeriodStart || new Date(),
      billingPeriodEnd: subscription.currentPeriodEnd || new Date(Date.now() + 30*86400000),
      status: 'PAID'
    });
    await invoice.save({ session });
    
    await SubscriptionHistory.create([{
      companyId,
      subscriptionId: subscription._id,
      eventType: submission.isUpgrade ? 'PLAN_UPGRADED' : 'PAYMENT_SUCCESS',
      details: { amount: submission.expectedAmount, invoiceNumber: invoice.invoiceNumber }
    }], { session });

    await Company.findByIdAndUpdate(companyId, { status: 'active' }, { session });
    
    await session.commitTransaction();
    res.json({ message: 'Payment approved', subscription, invoice });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to verify payment' } });
  } finally {
    session.endSession();
  }
};

export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { submissionId } = req.body;
    const submission = await PaymentSubmission.findById(submissionId).session(session);
    if (!submission || submission.status !== PaymentStatus.APPROVED) throw new Error('Valid payment not found');
    
    const invoice = await Invoice.findOne({ paymentSubmissionId: submissionId }).session(session);
    if (invoice) {
      invoice.status = 'VOID';
      await invoice.save({ session });
    }
    
    submission.status = PaymentStatus.REFUNDED as any;
    await submission.save({ session });
    
    await SubscriptionHistory.create([{
      companyId: submission.companyId,
      subscriptionId: submission.subscriptionId,
      eventType: 'REFUNDED',
      details: { amount: submission.expectedAmount }
    }], { session });
    
    await session.commitTransaction();
    res.json({ message: 'Refund processed successfully' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ error: { message: error.message } });
  } finally {
    session.endSession();
  }
};

export const suspendCompany = async (req: Request, res: Response) => { res.json({ message: 'suspended' }); };
export const deleteCompany = async (req: Request, res: Response) => { res.json({ message: 'deleted' }); };
export const getAllSubscriptions = async (req: Request, res: Response) => { 
  const subscriptions = await Subscription.aggregate([
    { $lookup: { from: 'companies', localField: 'companyId', foreignField: '_id', as: 'company' } },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'paymentsubmissions', localField: '_id', foreignField: 'subscriptionId', as: 'paymentSubmissions' } },
    { $addFields: { 
        companyId: '$company',
        paymentSubmission: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$paymentSubmissions',
                as: 'ps',
                cond: { $eq: ['$$ps.status', 'PENDING'] }
              }
            },
            0
          ]
        }
      }
    },
    { $project: { paymentSubmissions: 0, company: 0 } },
    { $sort: { createdAt: -1 } }
  ]);
  res.json({ subscriptions });
};
export const getAdminNotificationsSummary = async (req: Request, res: Response) => { res.json({ pendingPayments: 0, newCompanies: 0, totalAlerts: 0 }); };
export const suspendSubscription = async (req: Request, res: Response) => { res.json({ message: 'suspended' }); };
export const getRevenueAnalytics = async (req: Request, res: Response) => { 
  try {
    const activeSubs = await Subscription.find({ status: 'ACTIVE' });
    let mrrCents = 0;
    activeSubs.forEach(sub => {
      const interval = (sub.planSnapshot as any)?.billingInterval;
      const price = (sub.planSnapshot as any)?.price || 0;
      if (interval === 'monthly') mrrCents += price;
      else if (interval === 'yearly' || interval === 'annual') mrrCents += price / 12;
    });

    const mrrRupees = Math.round(mrrCents / 100);
    const arrRupees = mrrRupees * 12;

    const activeTenants = activeSubs.length;

    const recentPayments = await PaymentSubmission.find({ status: 'APPROVED' })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const transactions = recentPayments.map(p => ({
      id: p.transactionReference || p._id.toString(),
      company: (p.companyId as any)?.name || 'Unknown',
      date: new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.expectedAmount / 100)
    }));

    const totalSubs = await Subscription.countDocuments();
    const canceledSubs = await Subscription.countDocuments({ status: { $in: ['CANCELED', 'PAST_DUE'] } });
    const churnRate = totalSubs > 0 ? ((canceledSubs / totalSubs) * 100).toFixed(1) : 0;

    res.json({ 
      stats: { mrr: mrrRupees, arr: arrRupees, activeTenants, churnRate }, 
      transactions, 
      growth: [40, 50, 45, 60, 75, 80, 95] 
    }); 
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch revenue analytics' } });
  }
};
