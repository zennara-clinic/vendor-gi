import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'tonal' | 'espresso' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-accent-800',
  tonal: 'bg-accent-100 text-accent-800 hover:bg-accent-200 active:bg-accent-200',
  espresso: 'bg-ink-900 text-cream-50 hover:bg-ink-800 active:bg-ink-800',
  outline: 'bg-transparent text-accent-600 border border-accent-600 hover:bg-accent-50',
  ghost: 'bg-transparent text-accent-600 font-medium hover:bg-accent-50',
  destructive: 'bg-error-600 text-white hover:bg-error-700',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-4 text-[13px] gap-1.5',
  md: 'h-10 px-5 text-[14px] gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, full, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap select-none',
        'transition-colors duration-[120ms] active:scale-[0.98] transition-transform',
        'disabled:bg-cream-300 disabled:text-ink-400 disabled:border-transparent disabled:shadow-none disabled:active:scale-100',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="absolute h-4 w-4 animate-spin" aria-hidden />}
      <span className={cn('inline-flex items-center gap-[inherit]', loading && 'invisible')}>{children}</span>
    </button>
  );
});
