const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracksentra';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // Just use generic mongoose model for Plan
    const Plan = mongoose.models.Plan || mongoose.model('Plan', new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      currency: String,
      billingInterval: String,
      trialDurationDays: Number,
      features: [String],
      limits: Object,
      visibility: String,
      order: Number
    }));
    
    await Plan.deleteMany({});
    
    const plans = [
      {
        name: 'Starter Security',
        description: 'Perfect for small facilities and single sites.',
        price: 4900,
        currency: 'USD',
        billingInterval: 'monthly',
        trialDurationDays: 14,
        features: ['QR Checkpoints', 'Incident Reporting', 'Basic Analytics'],
        limits: { maxGuards: 5, maxSites: 1 },
        visibility: 'public',
        order: 1
      },
      {
        name: 'Professional',
        description: 'Advanced tools for growing security teams.',
        price: 14900,
        currency: 'USD',
        billingInterval: 'monthly',
        trialDurationDays: 14,
        features: ['Everything in Starter', 'Live GPS Tracking', 'Advanced Analytics', 'Guard Scheduling'],
        limits: { maxGuards: 20, maxSites: 5 },
        visibility: 'public',
        order: 2
      },
      {
        name: 'Enterprise',
        description: 'Full-scale solution for multi-site operations.',
        price: 39900,
        currency: 'USD',
        billingInterval: 'monthly',
        trialDurationDays: 14,
        features: ['Everything in Pro', 'Custom Integrations', 'Dedicated Support', 'API Access'],
        limits: { maxGuards: 100, maxSites: 25 },
        visibility: 'public',
        order: 3
      }
    ];

    await Plan.insertMany(plans);
    console.log('Plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
};

seed();
