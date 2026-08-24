import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Package, RotateCcw, Star, Truck, Wallet } from 'lucide-react';
import { panel } from '@/api/services';
import { formatCount, formatDate, formatINR } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/layout/PanelLayout';
import { StatCard, OrderStatusPill } from '@/components/common';
import { Img, RatingChip, Skeleton } from '@/components/ui';

function RevenueChart({ series }: { series: { day: string; revenue: number }[] }) {
  const max = Math.max(...series.map((s) => s.revenue));
  const W = 600, H = 160, pad = 4;
  const pts = series.map((s, i) => [pad + (i / (series.length - 1)) * (W - pad * 2), H - pad - (s.revenue / max) * (H - pad * 2)] as const);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" role="img" aria-label="Revenue over the last 30 days">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#CC785C" stopOpacity=".35" /><stop offset="1" stopColor="#CC785C" stopOpacity="0" /></linearGradient></defs>
      <path d={`${path} L${W - pad} ${H} L${pad} ${H} Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="#AB5336" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x, y], i) => i % 7 === 6 && <circle key={i} cx={x} cy={y} r="3" fill="#AB5336" />)}
    </svg>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const vendor = useAuth((s) => s.vendor)!;
  const { data: s } = useQuery({ queryKey: ['stats'], queryFn: panel.stats });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: panel.orders });
  const h = new Date().getHours();
  if (!s) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid md:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div><Skeleton className="h-64 rounded-lg" /></div>;
  const tasks = [
    { n: s.pendingOrders, t: 'new orders to confirm', to: '/orders?tab=NEW', icon: Package, tone: 'accent' },
    { n: s.toShip, t: 'orders ready to ship', to: '/orders?tab=PACKED', icon: Truck, tone: 'info' },
    { n: s.returns, t: 'return request to answer', to: '/returns', icon: RotateCcw, tone: 'warning' },
    { n: s.lowStock, t: 'products low on stock', to: '/inventory', icon: AlertTriangle, tone: 'warning' },
  ].filter((x) => x.n > 0);
  return (
    <div>
      <PageHeader title={`${h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}, ${vendor.ownerName.split(' ')[0]}`} subtitle={`Here is how ${vendor.businessName} is doing.`} />
      {tasks.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {tasks.map((t) => <Link key={t.t} to={t.to} className="rounded-lg bg-white border border-border-strong p-4 flex items-center gap-3 hover:shadow-md transition-shadow"><span className={`h-10 w-10 rounded-md inline-flex items-center justify-center ${t.tone === 'accent' ? 'bg-accent-100 text-accent-800' : t.tone === 'warning' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'}`}><t.icon className="h-5 w-5" /></span><span className="flex-1"><span className="block text-h4 text-ink-900 tabular">{t.n}</span><span className="block text-caption text-ink-500">{t.t}</span></span><ArrowRight className="h-4 w-4 text-ink-400" /></Link>)}
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today" value={formatINR(s.today.revenue)} sub={`${s.today.orders} orders`} />
        <StatCard label="This week" value={formatINR(s.week.revenue)} sub={`${s.week.orders} orders`} />
        <StatCard label="This month" value={formatINR(s.month.revenue)} sub={`${s.month.orders} orders`} />
        <StatCard label="Available for payout" value={formatINR(s.availableBalance)} sub={`Next payout ${formatDate(s.nextPayout.date)}`} icon={Wallet} tone="success" />
      </div>
      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <section className="rounded-lg bg-white border border-border-strong p-4 md:p-5">
          <div className="flex items-center justify-between mb-2"><h2 className="text-h4 text-ink-900">Revenue, last 30 days</h2><span className="text-caption text-ink-500">Gross sales before commission</span></div>
          <RevenueChart series={s.series} />
        </section>
        <section className="rounded-lg bg-white border border-border-strong p-4 md:p-5">
          <h2 className="text-h4 text-ink-900 mb-3">Top products</h2>
          <ol className="space-y-3">{s.topProducts.map((p, i) => <li key={p.id} className="flex items-center gap-3"><span className="text-caption text-ink-400 w-4 tabular">{i + 1}</span><Img src={p.image} alt="" className="h-11 w-11 rounded-md object-cover bg-cream-200" /><span className="min-w-0 flex-1"><span className="block text-body text-ink-900 line-clamp-1">{p.title}</span><span className="block text-caption text-ink-500">{p.sold} sold</span></span><span className="text-body font-semibold text-ink-900 tabular">{formatINR(p.revenue)}</span></li>)}</ol>
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between"><span className="text-body-sm text-ink-500 inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-ink-400" /> Store rating</span><RatingChip rating={s.rating} count={s.ratingCount} size="md" /></div>
        </section>
      </div>
      <section className="mt-6 rounded-lg bg-white border border-border-strong">
        <div className="px-4 md:px-5 py-3 border-b border-border-subtle flex items-center justify-between"><h2 className="text-h4 text-ink-900">Recent orders</h2><Link to="/orders" className="text-body-sm font-medium text-accent-600 hover:underline">All orders</Link></div>
        <ul className="divide-y divide-border-subtle">{(orders ?? []).slice(0, 6).map((o) => <li key={o.id}><Link to={`/orders/${o.id}`} className="px-4 md:px-5 py-3 flex items-center gap-4 hover:bg-cream-50"><span className="text-body font-medium text-ink-900 tabular w-36">{o.number}</span><span className="hidden md:block flex-1 text-body text-ink-700 line-clamp-1">{o.items[0]?.title}{o.items.length > 1 ? ` and ${o.items.length - 1} more` : ''}</span><span className="text-caption text-ink-500 hidden sm:block">{formatDate(o.placedAt)}</span><OrderStatusPill s={o.status} /><span className="text-body font-semibold text-ink-900 tabular w-24 text-right">{formatINR(o.total)}</span></Link></li>)}</ul>
      </section>
      <p className="mt-4 text-caption text-ink-400">{formatCount(s.ratingCount)} ratings across all products.</p>
    </div>
  );
}
