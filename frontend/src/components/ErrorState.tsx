import { ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'global' | '404' | '403' | 'network' | 'server' | 'empty' | 'validation';
  onRetry?: () => void;
  showHome?: boolean;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = "We couldn't load this information.",
  type = 'global',
  onRetry,
  showHome = false
}: ErrorStateProps) => {
  const navigate = useNavigate();

  let Icon = AlertTriangle;
  let iconColor = 'text-orange-500';
  let iconBg = 'bg-orange-500/10';

  if (type === '404') {
    Icon = XCircle;
    title = title !== 'Something went wrong' ? title : 'Not Found';
    message = message !== "We couldn't load this information." ? message : "The resource you're looking for doesn't exist.";
  } else if (type === '403') {
    Icon = ShieldAlert;
    iconColor = 'text-red-500';
    iconBg = 'bg-red-500/10';
    title = title !== 'Something went wrong' ? title : 'Access restricted';
    message = message !== "We couldn't load this information." ? message : "You don't have permission to access this area.";
  } else if (type === 'network') {
    title = title !== 'Something went wrong' ? title : 'Connection problem';
    message = message !== "We couldn't load this information." ? message : "We couldn't connect to TrackSentra. Check your internet connection and try again.";
  } else if (type === 'server') {
    title = title !== 'Something went wrong' ? title : 'Something went wrong';
    message = message !== "We couldn't load this information." ? message : "Our servers couldn't complete this request.";
  } else if (type === 'validation') {
    iconColor = 'text-amber-500';
    iconBg = 'bg-amber-500/10';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full">
      <div className={`w-16 h-16 ${iconBg} ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon size={32} />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 mb-6 text-sm max-w-sm">
        {message}
      </p>
      
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors text-sm"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        )}
        
        {showHome && (
          <Link 
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1e1e24] text-white rounded-lg font-medium hover:bg-[#2a2a32] transition-colors border border-[#2a2a32] text-sm"
          >
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
};
