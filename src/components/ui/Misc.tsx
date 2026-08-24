import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={cn('rounded-lg bg-white border border-border-strong', className)}>{children}</Tag>;
}

export function SectionHeader({ title, subtitle, href, linkLabel = 'View all', className }: { title: string; subtitle?: string; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-4', className)}>
      <div>
        <h2 className="text-h2 text-ink-900">{title}</h2>
        {subtitle && <p className="text-body text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href} className="text-body font-medium text-accent-600 hover:text-accent-700 hover:underline whitespace-nowrap inline-flex items-center gap-0.5">
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-body-sm text-ink-500 overflow-x-auto scrollbar-none">
      <ol className="flex items-center gap-1 whitespace-nowrap">
        <li><Link to="/" className="hover:text-accent-600">Home</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
            {it.href ? <Link to={it.href} className="hover:text-accent-600">{it.label}</Link> : <span className="text-ink-700" aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = 'md' }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  const w = size === 'sm' ? 'w-8' : 'w-10';
  return (
    <div className={cn('inline-flex items-center rounded-md border border-border-strong bg-white overflow-hidden', h)} role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)} className={cn(w, 'h-full inline-flex items-center justify-center text-ink-700 hover:bg-cream-100 disabled:text-ink-300 disabled:hover:bg-transparent')}>
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn('min-w-10 text-center text-body font-semibold tabular border-x border-border-subtle leading-none', h, 'inline-flex items-center justify-center')} aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={cn(w, 'h-full inline-flex items-center justify-center text-ink-700 hover:bg-cream-100 disabled:text-ink-300 disabled:hover:bg-transparent')}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <div className="h-[120px] w-[120px] rounded-full bg-cream-200 text-accent-500 flex items-center justify-center mb-5 [&>svg]:h-14 [&>svg]:w-14">{icon}</div>
      <h3 className="text-h3 text-ink-900">{title}</h3>
      {description && <p className="text-body text-ink-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Chip({ selected, onClick, children, onRemove, className }: { selected?: boolean; onClick?: () => void; onRemove?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-body-sm whitespace-nowrap transition-colors duration-[120ms]',
        selected ? 'bg-accent-100 border-accent-600 text-accent-800 font-medium' : 'bg-white border-border-strong text-ink-700 hover:bg-cream-50',
        className,
      )}
    >
      {children}
      {onRemove && selected && (
        <span role="button" aria-label="Remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-[14px] leading-none ml-0.5">✕</span>
      )}
    </button>
  );
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  const ini = name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('');
  return src ? (
    <img src={src} alt={name} width={size} height={size} className={cn('rounded-full object-cover shrink-0', className)} style={{ width: size, height: size }} />
  ) : (
    <span className={cn('inline-flex items-center justify-center rounded-full bg-cream-300 text-ink-700 font-semibold shrink-0', className)} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden>
      {ini}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-border-subtle', className)} />;
}

export function InlineBanner({ tone = 'info', children, className }: { tone?: 'info' | 'success' | 'warning' | 'error'; children: ReactNode; className?: string }) {
  const tones = {
    info: 'bg-accent-50 border-accent-200 text-ink-700',
    success: 'bg-success-50 border-success-600/30 text-success-700',
    warning: 'bg-warning-50 border-warning-400 text-warning-600',
    error: 'bg-error-50 border-error-600/30 text-error-700',
  };
  return <div className={cn('rounded-md border px-4 py-3 text-body', tones[tone], className)}>{children}</div>;
}

export function Img({ src, alt, className, fallback, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.dataset.fallen) return;
        el.dataset.fallen = '1';
        el.src = fallback ?? '/placeholder.svg';
      }}
      className={className}
      {...rest}
    />
  );
}
