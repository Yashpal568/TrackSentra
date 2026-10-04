import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { User } from '../models/User';

export const getPlatformDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: 'active' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // In a real app we'd calculate MRR from subscriptions
    // Let's query recently created companies
    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt status');

    res.json({
      kpis: {
        totalCompanies,
        activeCompanies,
        trialCompanies: 0, // Placeholder
        activeUsers,
        mrr: 0, // Placeholder since we don't have a payments DB ready yet
        openTickets: 0 // Placeholder
      },
      recentCompanies
    });
  } catch (error) {
    console.error('Error fetching platform dashboard:', error);
    res.status(500).json({ error: { message: 'Failed to fetch platform metrics' } });
  }
};
