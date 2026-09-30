import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, X } from 'lucide-react';

interface OnboardingStatus {
  dismissed: boolean;
  steps: {
    profile_completed: boolean;
    site_created: boolean;
    guard_added: boolean;
    checkpoint_created: boolean;
    patrol_scheduled: boolean;
  };
  isComplete: boolean;
}

export const OnboardingChecklist: React.FC = () => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/api/onboarding/status');
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch onboarding status', err);
      }
    };
    fetchStatus();
  }, []);

  const handleDismiss = async () => {
    try {
      await api.post('/api/onboarding/dismiss');
      setStatus(prev => prev ? { ...prev, dismissed: true } : null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!status || status.dismissed || status.isComplete) {
    return null; // hide if complete or dismissed
  }

  const steps = [
    { key: 'profile_completed', label: 'Complete Company Profile', path: '/profile' },
    { key: 'site_created', label: 'Create your first Site', path: '/sites' },
    { key: 'checkpoint_created', label: 'Configure Checkpoints', path: '/checkpoints' },
    { key: 'guard_added', label: 'Add Guards', path: '/guards' },
    { key: 'patrol_scheduled', label: 'Schedule a Patrol Route', path: '/patrols' }
  ];

  const total = steps.length;
  const completed = steps.filter(s => status.steps[s.key as keyof typeof status.steps]).length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 relative">
      <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <X size={20} />
      </button>
      
      <h2 className="text-lg font-bold mb-2">Welcome to TrackSentra!</h2>
      <p className="text-gray-600 mb-4 text-sm">Follow these steps to get your security operations up and running.</p>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-3">
        {steps.map(step => {
          const isDone = status.steps[step.key as keyof typeof status.steps];
          return (
            <Link 
              key={step.key} 
              to={step.path}
              className={`flex items-center p-3 rounded-md border ${isDone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
            >
              {isDone ? (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              ) : (
                <Circle className="text-gray-400 mr-3" size={20} />
              )}
              <span className={`flex-1 ${isDone ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
                {step.label}
              </span>
              {!isDone && <span className="text-sm text-blue-600">Go &rarr;</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
