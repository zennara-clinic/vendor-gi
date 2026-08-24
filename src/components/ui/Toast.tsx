import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useUI } from '@/store/ui';

export function ToastRegion() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div aria-live="polite" className="fixed z-70 bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 w-[calc(100%-32px)] max-w-[400px] pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-md bg-ink-900 text-cream-50 text-body px-4 py-3 shadow-lg animate-slide-up">
          {t.kind === 'success' && <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />}
          {t.kind === 'error' && <XCircle className="h-5 w-5 text-error-600 shrink-0" />}
          {t.kind === 'warning' && <AlertTriangle className="h-5 w-5 text-warning-400 shrink-0" />}
          {(!t.kind || t.kind === 'info') && <Info className="h-5 w-5 text-accent-300 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          {t.action && <Link to={t.action.href} className="text-accent-300 font-medium whitespace-nowrap hover:underline">{t.action.label}</Link>}
        </div>
      ))}
    </div>
  );
}
