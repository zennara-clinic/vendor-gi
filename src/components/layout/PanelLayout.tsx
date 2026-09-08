import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Bell, Box, ChevronDown, ExternalLink, FileCheck, LayoutDashboard, LogOut, Menu, Package, Percent, Settings, Star, Wallet, X, HelpCircle, Warehouse, RotateCcw } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { panel } from '@/api/services';
import { STORE_URL } from '@/api/client';
import { useLockBody } from '@/hooks';
import { Avatar, ToastRegion } from '@/components/ui';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: Package, label: 'Orders' },
  { to: '/returns', icon: RotateCcw, label: 'Returns' },
  { to: '/products', icon: Box, label: 'Products' },
  { to: '/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/coupons', icon: Percent, label: 'Coupons' },
  { to: '/earnings', icon: Wallet, label: 'Earnings' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/certificates', icon: FileCheck, label: 'GI Certificates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const vendor = useAuth((s) => s.vendor);
  return (
    <div className="h-full flex flex-col">
      <div className="h-20 px-5 flex items-center border-b border-border-subtle"><Link to="/dashboard"><img src="/logo.png" alt="Tag Traditions" width={800} height={347} className="h-14 w-auto" /></Link></div>
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
        <Avatar name={vendor?.businessName ?? ''} src={vendor?.logo} size={40} />
        <div className="min-w-0"><div className="text-body font-semibold text-ink-900 truncate">{vendor?.businessName}</div><div className="text-caption text-success-700 inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Verified seller</div></div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} onClick={onNavigate} className={({ isActive }) => cn('mx-3 my-0.5 h-10 px-3 rounded-md flex items-center gap-3 text-body transition-colors', isActive ? 'bg-accent-100 text-accent-800 font-medium' : 'text-ink-700 hover:bg-cream-100')}>
            <n.icon className="h-5 w-5" /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border-subtle">
        <a href={STORE_URL} target="_blank" rel="noreferrer" className="h-10 px-3 rounded-md flex items-center gap-3 text-body text-ink-700 hover:bg-cream-100"><ExternalLink className="h-5 w-5" /> View store</a>
        <Link to="/help" onClick={onNavigate} className="h-10 px-3 rounded-md flex items-center gap-3 text-body text-ink-700 hover:bg-cream-100"><HelpCircle className="h-5 w-5" /> Seller help</Link>
      </div>
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: panel.notifications });
  const unread = data?.filter((n) => !n.read).length ?? 0;
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative h-10 w-10 rounded-full inline-flex items-center justify-center text-ink-700 hover:bg-cream-100"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-accent-600 text-white text-micro inline-flex items-center justify-center">{unread}</span>}</button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-white shadow-md z-30 animate-fade-in">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between"><span className="text-body font-semibold text-ink-900">Notifications</span>{unread > 0 && <button onClick={async () => { await panel.markRead(); qc.invalidateQueries({ queryKey: ['notifications'] }); }} className="text-caption text-accent-600 hover:underline">Mark all read</button>}</div>
          <ul className="max-h-96 overflow-y-auto">{data?.map((n) => <li key={n.id}><Link to={n.link ?? '#'} onClick={() => setOpen(false)} className={cn('block px-4 py-3 hover:bg-cream-50', !n.read && 'bg-accent-50/60')}><div className={cn('text-body text-ink-900', !n.read && 'font-semibold')}>{n.title}</div><div className="text-caption text-ink-500">{n.body}</div><div className="text-micro text-ink-400 mt-0.5">{formatDate(n.at, { hour: '2-digit', minute: '2-digit' })}</div></Link></li>)}</ul>
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { vendor, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="h-10 pl-1 pr-2 rounded-full inline-flex items-center gap-2 hover:bg-cream-100"><Avatar name={vendor?.ownerName ?? ''} size={32} /><span className="hidden md:inline text-body text-ink-900">{vendor?.ownerName}</span><ChevronDown className="h-4 w-4 text-ink-500" /></button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-md z-30 py-1 animate-fade-in">
          <Link to="/settings" onClick={() => setOpen(false)} className="h-10 px-4 flex items-center gap-3 text-body text-ink-700 hover:bg-cream-50"><Settings className="h-4 w-4" /> Settings</Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full h-10 px-4 flex items-center gap-3 text-body text-ink-700 hover:bg-cream-50 border-t border-border-subtle"><LogOut className="h-4 w-4" /> Log out</button>
        </div>
      )}
    </div>
  );
}

export function PanelLayout() {
  const { sidebarOpen, setSidebar } = useUI();
  const { pathname } = useLocation();
  useLockBody(sidebarOpen);
  useEffect(() => setSidebar(false), [pathname, setSidebar]);
  return (
    <div className="min-h-dvh bg-cream-100 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:block sticky top-0 h-dvh bg-white border-r border-border-strong"><Sidebar /></aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-[var(--scrim)]" onClick={() => setSidebar(false)} /><div className="absolute top-0 bottom-0 left-0 w-[280px] bg-white shadow-lg"><Sidebar onNavigate={() => setSidebar(false)} /><button onClick={() => setSidebar(false)} aria-label="Close" className="absolute top-3 right-3 h-10 w-10 inline-flex items-center justify-center rounded-full text-ink-700"><X className="h-5 w-5" /></button></div></div>
      )}
      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 h-16 bg-cream-100/95 backdrop-blur border-b border-border-strong px-4 md:px-6 flex items-center gap-3">
          <button onClick={() => setSidebar(true)} className="lg:hidden h-10 w-10 -ml-2 inline-flex items-center justify-center rounded-md text-ink-700" aria-label="Menu"><Menu className="h-6 w-6" /></button>
          <div className="lg:hidden"><img src="/logo.png" alt="Tag Traditions" width={800} height={347} className="h-11 w-auto" /></div>
          <div className="ml-auto flex items-center gap-1"><Notifications /><AccountMenu /></div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full">
          <Suspense fallback={<div className="space-y-4"><div className="skeleton h-8 w-56 rounded-xs" /><div className="skeleton h-72 rounded-lg" /></div>}><Outlet /></Suspense>
        </main>
      </div>
      <ToastRegion />
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-5 md:mb-6">
      <div><h1 className="font-display text-[26px] leading-8 md:text-[30px] md:leading-9 font-semibold text-ink-900">{title}</h1>{subtitle && <p className="text-body text-ink-500 mt-1">{subtitle}</p>}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
