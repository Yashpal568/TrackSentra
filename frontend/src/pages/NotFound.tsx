import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="max-w-md w-full bg-[#121214] border border-[#1e1e24] rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-3">Page not found</h2>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          The page you're looking for doesn't exist or may have moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            <span>Go to Dashboard</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e1e24] text-white rounded-lg font-medium hover:bg-[#2a2a32] transition-colors border border-[#2a2a32]"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
