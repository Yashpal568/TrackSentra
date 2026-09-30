import { Shield, QrCode, MapPin, BarChart3, AlertTriangle, Users, Smartphone, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Features = () => {
  const features = [
    {
      icon: <QrCode className="w-10 h-10 text-blue-500" />,
      title: 'QR Checkpoints',
      description: 'Generate and print QR codes to place around your facility. Guards scan these codes using their mobile devices to prove presence and complete assigned patrol routes.'
    },
    {
      icon: <MapPin className="w-10 h-10 text-green-500" />,
      title: 'GPS Verification',
      description: 'Every checkpoint scan and incident report captures GPS coordinates. Verify that guards are exactly where they are supposed to be.'
    },
    {
      icon: <Users className="w-10 h-10 text-purple-500" />,
      title: 'Shift & Guard Management',
      description: 'Easily schedule shifts, assign guards to specific sites and routes, and ensure 24/7 coverage of your industrial facilities.'
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-orange-500" />,
      title: 'Real-time Reports',
      description: 'Automated operational summaries and detailed guard reports. Export data to CSV for compliance and client reporting.'
    },
    {
      icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
      title: 'Incident Management',
      description: 'Guards can file incident reports directly from the field with photos and notes. Managers are alerted instantly to resolve issues.'
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-500" />,
      title: 'Live Monitoring',
      description: 'View all active patrols globally on a live dashboard. Track progress, missed checkpoints, and anomalies in real-time.'
    },
    {
      icon: <Smartphone className="w-10 h-10 text-indigo-500" />,
      title: 'Mobile First Guard UI',
      description: 'The guard interface is optimized for mobile devices, making it incredibly easy for field personnel to execute patrols without training.'
    },
    {
      icon: <Shield className="w-10 h-10 text-slate-700" />,
      title: 'Multi-tenant Security',
      description: 'Enterprise-grade security with strict tenant isolation. Your company data, sites, and guards are completely private.'
    }
  ];

  return (
    <div className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Powerful Features for Modern Security</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          TrackSentra gives you the tools you need to manage, monitor, and optimize your security patrols efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-lg">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
