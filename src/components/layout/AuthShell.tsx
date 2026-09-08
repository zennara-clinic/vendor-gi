import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { STORE_URL } from '@/api/client';

export function AuthShell({ title, subtitle, children, footer, wide }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      <div className="container-page h-16 flex items-center justify-between">
        <a href={STORE_URL} className="inline-flex items-center gap-1.5 text-body-sm text-ink-500 hover:text-ink-900">Tag Traditions store <ExternalLink className="h-3.5 w-3.5" /></a>
        <span className="text-caption font-semibold uppercase tracking-[0.12em] text-ink-400">Seller Centre</span>
      </div>
      <main className="flex-1 flex flex-col items-center px-4 pb-12">
        <img src="/logo.png" alt="Tag Traditions" width={800} height={347} className="h-16 w-auto mt-2 mb-8" />
        <div className={`w-full ${wide ? 'max-w-[640px]' : 'max-w-[400px]'} rounded-lg bg-white border border-border-strong p-6 md:p-8`}>
          <h1 className="font-display text-[26px] leading-8 font-semibold text-ink-900 text-center">{title}</h1>
          {subtitle && <p className="text-body text-ink-500 text-center mt-1.5">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-body text-ink-700 text-center">{footer}</div>}
      </main>
    </div>
  );
}
