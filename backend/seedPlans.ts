import mongoose from 'mongoose';
import { Plan } from './src/models/Plan';
import { SystemSettings } from './src/models/SystemSettings';
import dotenv from 'dotenv';
dotenv.config();

const plans = [
  {
    name: 'Starter Plan',
    description: 'Perfect for small agencies managing up to 3 sites.',
    price: 4900,
    currency: 'INR',
    billingInterval: 'monthly',
    trialDurationDays: 14,
    features: ['Up to 5 Guards', 'Up to 3 Sites', 'Basic Reporting', 'Email Support'],
    limits: {
      maxGuards: 5,
      maxSites: 3
    },
    visibility: 'public',
    order: 1
  },
  {
    name: 'Professional Plan',
    description: 'The standard choice for growing security operations.',
    price: 12900,
    currency: 'INR',
    billingInterval: 'monthly',
    trialDurationDays: 14,
    features: ['Up to 25 Guards', 'Up to 10 Sites', 'Advanced Analytics', 'Priority Support', 'GPS Tracking'],
    limits: {
      maxGuards: 25,
      maxSites: 10
    },
    visibility: 'public',
    order: 2
  },
  {
    name: 'Enterprise Plan',
    description: 'For large operations requiring high scale.',
    price: 39900,
    currency: 'INR',
    billingInterval: 'monthly',
    trialDurationDays: 14,
    features: ['Unlimited Guards', 'Unlimited Sites', 'Dedicated Success Manager', '24/7 Phone Support', 'API Access', 'Custom Branding'],
    limits: {
      maxGuards: 99999,
      maxSites: 99999
    },
    visibility: 'public',
    order: 3
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracksentra');
  
  console.log('Clearing existing plans...');
  await Plan.deleteMany({});
  
  console.log('Inserting new plans...');
  await Plan.insertMany(plans);
  
  console.log('Configuring manual payment settings for UPI...');
  const upiId = 'yash38687-1@okaxis';
  
  let settings = await SystemSettings.findById('global_settings');
  if (!settings) {
    settings = new SystemSettings({ _id: 'global_settings' });
  }
  
  settings.manualPaymentInstructions = {
    upiId: upiId,
    bankName: 'UPI',
    accountName: 'Yash',
    accountNumber: '-',
    ifsc: '-'
  };
  
  await settings.save();
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
