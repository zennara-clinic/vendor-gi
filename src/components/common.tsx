import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { OrderStatus, ProductStatus } from '@/types';

export function StatCard({ label, value, sub, icon: Icon, tone = 'default' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: React.ComponentType<{ className?: string }>; tone?: 'default' | 'accent' | 'success' | 'warning' }) {
  return (
    <div className="rounded-lg bg-white border border-border-strong p-4 md:p-5">
      <div className="flex items-center justify-between"><span className="text-caption uppercase tracking-[0.06em] text-ink-500 font-medium">{label}</span>{Icon && <Icon className={cn('h-5 w-5', tone === 'accent' ? 'text-accent-600' : tone === 'success' ? 'text-success-600' : tone === 'warning' ? 'text-warning-600' : 'text-ink-400')} />}</div>
      <div className="mt-2 font-display text-[28px] leading-8 font-semibold text-ink-900 tabular">{value}</div>
      {sub && <div className="text-caption text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}

export const ORDER_LABEL: Record<OrderStatus, string> = { NEW: 'New', CONFIRMED: 'Confirmed', PACKED: 'Packed', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', RETURN_REQUESTED: 'Return requested', RETURNED: 'Returned' };
export function OrderStatusPill({ s }: { s: OrderStatus }) {
  const tone = s === 'NEW' ? 'bg-accent-100 text-accent-800' : s === 'DELIVERED' ? 'bg-success-50 text-success-700' : s === 'CANCELLED' || s === 'RETURNED' ? 'bg-error-50 text-error-700' : s === 'RETURN_REQUESTED' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600';
  return <span className={cn('inline-flex items-center rounded-xs px-2 py-0.5 text-caption font-semibold whitespace-nowrap', tone)}>{ORDER_LABEL[s]}</span>;
}
export const PRODUCT_LABEL: Record<ProductStatus, string> = { DRAFT: 'Draft', PENDING_REVIEW: 'In review', APPROVED: 'Live', REJECTED: 'Rejected', CHANGES_REQUIRED: 'Changes required', OUT_OF_STOCK: 'Out of stock', INACTIVE: 'Inactive', ARCHIVED: 'Archived' };
export function ProductStatusPill({ s }: { s: ProductStatus }) {
  const tone = s === 'APPROVED' ? 'bg-success-50 text-success-700' : s === 'PENDING_REVIEW' ? 'bg-info-50 text-info-600' : s === 'CHANGES_REQUIRED' || s === 'OUT_OF_STOCK' ? 'bg-warning-50 text-warning-600' : s === 'REJECTED' ? 'bg-error-50 text-error-700' : 'bg-cream-200 text-ink-700';
  return <span className={cn('inline-flex items-center rounded-xs px-2 py-0.5 text-caption font-semibold whitespace-nowrap', tone)}>{PRODUCT_LABEL[s]}</span>;
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg bg-white border border-border-strong overflow-x-auto', className)}><table className="w-full text-body min-w-[640px]">{children}</table></div>;
}
export function Th({ children, className, right }: { children?: ReactNode; className?: string; right?: boolean }) { return <th className={cn('text-left text-caption uppercase tracking-[0.04em] font-semibold text-ink-500 px-4 py-3 border-b border-border-subtle bg-cream-50/60', right && 'text-right', className)}>{children}</th>; }
export function Td({ children, className, right }: { children?: ReactNode; className?: string; right?: boolean }) { return <td className={cn('px-4 py-3 border-b border-border-subtle last:border-0 align-middle', right && 'text-right tabular', className)}>{children}</td>; }

export function Tabs({ tabs, value, onChange }: { tabs: { key: string; label: string; count?: number }[]; value: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border-strong mb-4">
      {tabs.map((t) => <button key={t.key} onClick={() => onChange(t.key)} className={cn('h-10 px-3 inline-flex items-center gap-1.5 text-body-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors', value === t.key ? 'border-accent-600 text-accent-700' : 'border-transparent text-ink-500 hover:text-ink-900')}>{t.label}{t.count != null && <span className={cn('rounded-full px-1.5 text-micro', value === t.key ? 'bg-accent-100 text-accent-800' : 'bg-cream-200 text-ink-700')}>{t.count}</span>}</button>)}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return <div className="rounded-lg bg-white border border-border-strong p-10 text-center"><div className="text-h4 text-ink-900">{title}</div>{body && <p className="text-body text-ink-500 mt-1">{body}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}
