import { cn, discountPercent, formatINR, priceA11yLabel } from '@/lib/utils';

interface PriceProps {
  price: number;
  mrp?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTaxNote?: boolean;
}

/** Fixed price format: selling → MRP (struck) → % off (Design.md §6.7) */
export function Price({ price, mrp, size = 'md', className, showTaxNote }: PriceProps) {
  const pct = discountPercent(price, mrp);
  const sizes = {
    sm: 'text-[14px] leading-5',
    md: 'text-[16px] leading-6',
    lg: 'text-[20px] leading-7',
    xl: 'text-[28px] leading-9',
  };
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-2 flex-wrap" aria-label={priceA11yLabel(price, mrp)}>
        <span className={cn('font-bold text-ink-900 tabular', sizes[size])}>{formatINR(price)}</span>
        {pct && (
          <>
            <span className={cn('text-ink-400 line-through tabular', size === 'xl' ? 'text-body-lg' : 'text-body-sm')} aria-hidden>
              {formatINR(mrp!)}
            </span>
            <span className={cn('font-bold text-success-700', size === 'xl' ? 'text-body-lg' : 'text-body-sm')} aria-hidden>
              {pct}% off
            </span>
          </>
        )}
      </div>
      {showTaxNote && <span className="text-caption text-ink-500">inclusive of all taxes</span>}
    </div>
  );
}
