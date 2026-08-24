import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian digit grouping: 104999 -> "1,04,999" (Design.md §6.7) */
export function formatINR(amount: number, opts: { decimals?: boolean } = {}): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: opts.decimals ? 2 : 0,
    minimumFractionDigits: opts.decimals ? 2 : 0,
  });
  return `₹${formatter.format(amount)}`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

/** Discount % shown only when ≥5% (Design.md §6.7) */
export function discountPercent(price: number, mrp?: number | null): number | null {
  if (!mrp || mrp <= price) return null;
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct >= 5 ? pct : null;
}

export function priceA11yLabel(price: number, mrp?: number | null): string {
  const pct = discountPercent(price, mrp);
  if (!pct) return formatINR(price);
  return `${formatINR(price)}, original price ${formatINR(mrp!)}, ${pct} percent off`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

/** "Free delivery by Tue, 26 Aug" */
export function deliveryEstimate(daysFromNow = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function pluralize(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}
