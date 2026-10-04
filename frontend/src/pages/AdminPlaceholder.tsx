import { Hammer } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function AdminPlaceholder({ title, description }: PlaceholderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-surface-sidebar border border-border-subtle rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/10 transition-opacity group-hover:opacity-100 opacity-50"></div>
        <Hammer size={32} className="text-emerald-500 relative z-10" />
      </div>
      <h1 className="text-3xl font-black text-text-main mb-3 tracking-tight">{title}</h1>
      <p className="text-text-secondary text-center max-w-md font-medium text-sm">
        {description}
      </p>
      
      <div className="mt-12 bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm w-full max-w-xl">
        <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider">Module Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-surface-main rounded-lg border border-border-subtle">
            <span className="text-sm font-medium text-text-secondary">UI/UX Design</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400">Completed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-main rounded-lg border border-border-subtle">
            <span className="text-sm font-medium text-text-secondary">Backend APIs</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400">Completed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-main rounded-lg border border-border-subtle">
            <span className="text-sm font-medium text-text-secondary">Frontend Integration</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-500">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
