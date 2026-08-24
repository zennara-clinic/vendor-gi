import { useQuery } from '@tanstack/react-query';
import { Download, Landmark } from 'lucide-react';
import { panel } from '@/api/services';
import { cn, formatDate, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { PageHeader } from '@/components/layout/PanelLayout';
import { StatCard, Table, Td, Th } from '@/components/common';
import { Button, Skeleton } from '@/components/ui';

export default function EarningsPage() {
  useDocumentTitle('Earnings');
  const vendor = useAuth((s) => s.vendor)!;
  const toast = useUI((s) => s.toast);
  const { data: s } = useQuery({ queryKey: ['stats'], queryFn: panel.stats });
  const { data: tx } = useQuery({ queryKey: ['transactions'], queryFn: panel.transactions });
  const { data: payouts } = useQuery({ queryKey: ['payouts'], queryFn: panel.payouts });
  const label = { SALE: 'Sale', COMMISSION: 'Commission', REFUND: 'Refund', PAYOUT: 'Payout', TDS: 'TDS', ADJUSTMENT: 'Adjustment' };
  return (
    <div>
      <PageHeader title="Earnings" subtitle={`Commission ${vendor.commissionPct}%. Earnings become available 7 days after delivery and are paid out every Monday.`} actions={<><Button variant="outline" onClick={() => toast({ message: 'GST report (B2C, HSN-wise) downloads from the server', kind: 'info' })}><Download className="h-4 w-4" /> GST report</Button><Button variant="outline" onClick={() => toast({ message: 'TDS certificate downloads from the server', kind: 'info' })}><Download className="h-4 w-4" /> TDS</Button></>} />
      {!s ? <Skeleton className="h-28 rounded-lg" /> : (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Available" value={formatINR(s.availableBalance)} sub={`Paid on ${formatDate(s.nextPayout.date)}`} tone="success" />
          <StatCard label="Pending" value={formatINR(s.pendingBalance)} sub="Inside the return window" />
          <StatCard label="This month, gross" value={formatINR(s.month.revenue)} sub={`${s.month.orders} orders`} />
        </div>
      )}
      <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-4 items-start">
        <section>
          <h2 className="text-h4 text-ink-900 mb-3">Transactions</h2>
          {!tx ? <Skeleton className="h-64 rounded-lg" /> : (
            <Table><thead><tr><Th>Date</Th><Th>Type</Th><Th>Reference</Th><Th>Status</Th><Th right>Amount</Th></tr></thead>
              <tbody>{tx.map((t) => <tr key={t.id}><Td className="whitespace-nowrap text-ink-700">{formatDate(t.at)}</Td><Td className="text-ink-900">{label[t.type]}</Td><Td className="tabular text-ink-700">{t.ref}</Td><Td><span className={cn('text-caption font-semibold', t.status === 'PAID' ? 'text-ink-500' : t.status === 'AVAILABLE' ? 'text-success-700' : 'text-warning-600')}>{t.status.toLowerCase()}</span></Td><Td right className={cn('font-semibold', t.amount < 0 ? 'text-error-700' : 'text-ink-900')}>{t.amount < 0 ? '- ' : ''}{formatINR(Math.abs(t.amount))}</Td></tr>)}</tbody></Table>
          )}
        </section>
        <section>
          <h2 className="text-h4 text-ink-900 mb-3">Payouts</h2>
          <div className="rounded-lg bg-white border border-border-strong divide-y divide-border-subtle">
            {(payouts ?? []).map((p) => <div key={p.id} className="p-4 flex items-center gap-3"><span className="h-10 w-10 rounded-md bg-cream-100 inline-flex items-center justify-center text-ink-500"><Landmark className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="text-body text-ink-900">{p.period}</div><div className="text-caption text-ink-500">{p.status === 'PAID' ? `Paid ${formatDate(p.paidAt!)}, ref ${p.bankRef}` : p.status === 'SCHEDULED' ? 'Scheduled for Monday' : p.status.toLowerCase()}</div></div><div className={cn('font-semibold tabular', p.status === 'PAID' ? 'text-ink-900' : 'text-success-700')}>{formatINR(p.amount)}</div></div>)}
          </div>
          <div className="mt-3 rounded-lg bg-cream-100 p-4 text-body-sm text-ink-700"><div className="font-semibold text-ink-900">Bank account</div>{vendor.bank?.bankName}, {vendor.bank?.accountNumber}, IFSC {vendor.bank?.ifsc}</div>
        </section>
      </div>
    </div>
  );
}
