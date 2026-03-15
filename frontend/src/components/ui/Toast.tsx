import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useToast } from '../../hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-300 min-w-[320px]",
            toast.type === 'success' ? "bg-emerald-50/90 border-emerald-100 text-emerald-800" :
            toast.type === 'error' ? "bg-red-50/90 border-red-100 text-red-800" :
            "bg-white/90 border-white/60 text-slate-800"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
            toast.type === 'success' ? "bg-emerald-100 text-emerald-600" :
            toast.type === 'error' ? "bg-red-100 text-red-600" :
            "bg-slate-100 text-slate-600"
          )}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
};
