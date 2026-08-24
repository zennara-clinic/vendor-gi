import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLockBody } from '@/hooks';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** On mobile render as bottom sheet (default true) */
  sheet?: boolean;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, size = 'md', sheet = true, footer }: ModalProps) {
  useLockBody(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'md:max-w-[420px]', md: 'md:max-w-[480px]', lg: 'md:max-w-[720px]' };

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[var(--scrim)] animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative w-full bg-white shadow-lg flex flex-col max-h-[92dvh] md:max-h-[85vh]',
          sheet ? 'rounded-t-xl md:rounded-xl animate-slide-up md:animate-scale-in' : 'rounded-xl animate-scale-in m-4',
          widths[size],
        )}
      >
        {sheet && <div className="md:hidden mx-auto mt-2 h-1 w-8 rounded-full bg-ink-300" />}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          {title && <h3 className="text-h3 text-ink-900">{title}</h3>}
          <button onClick={onClose} aria-label="Close" className="ml-auto h-10 w-10 -mr-2 inline-flex items-center justify-center rounded-full text-ink-700 hover:bg-cream-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border-subtle bg-white rounded-b-xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, side = 'right', footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; side?: 'right' | 'left'; footer?: ReactNode }) {
  useLockBody(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[var(--scrim)] animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-[420px] bg-white shadow-lg flex flex-col',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 [animation:slide-in-right_300ms_var(--ease-standard)_reverse]',
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border-subtle">
          <h3 className="text-h4 text-ink-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="h-10 w-10 -mr-2 inline-flex items-center justify-center rounded-full text-ink-700 hover:bg-cream-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-border-strong p-4 bg-white">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
