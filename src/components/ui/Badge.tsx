import type { ReactNode } from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductBadge } from '@/types';

type Tone = 'deal' | 'new' | 'bestseller' | 'trust' | 'neutral' | 'success' | 'error' | 'warning' | 'info';

const tones: Record<Tone, string> = {
  deal: 'bg-warning-400 text-ink-900',
  new: 'bg-accent-100 text-accent-800',
  bestseller: 'bg-ink-900 text-cream-50',
  trust: 'bg-info-600 text-white',
  neutral: 'bg-cream-200 text-ink-700',
  success: 'bg-success-600 text-white',
  error: 'bg-error-50 text-error-700',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-info-50 text-info-600',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-micro font-semibold uppercase tracking-[0.04em]', tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProductBadgeChip({ badge, className }: { badge: ProductBadge; className?: string }) {
  switch (badge) {
    case 'DEAL': return <Badge tone="deal" className={className}>Deal</Badge>;
    case 'NEW': return <Badge tone="new" className={className}>New</Badge>;
    case 'BESTSELLER': return <Badge tone="bestseller" className={className}>Bestseller</Badge>;
    case 'GI_VERIFIED': return <Badge tone="trust" className={className}><ShieldCheck className="h-3 w-3" /> GI Verified</Badge>;
  }
}

/** Green rating chip (Design.md §6.6) */
export function RatingChip({ rating, count, size = 'sm', className }: { rating: number; count?: number; size?: 'sm' | 'md'; className?: string }) {
  const low = rating < 3;
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-xs font-bold tabular leading-none',
          low ? 'bg-warning-600' : 'bg-success-600',
          size === 'sm' ? 'h-5 px-1.5 text-[12px]' : 'h-6 px-2 text-[13px]',
        )}
        style={{ color: '#FFFFFF' }}
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        {rating.toFixed(1)}
        <Star className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} fill="#FFFFFF" stroke="#FFFFFF" />
      </span>
      {count != null && <span className="text-caption text-ink-500 tabular">({new Intl.NumberFormat('en-IN').format(count)})</span>}
    </span>
  );
}
