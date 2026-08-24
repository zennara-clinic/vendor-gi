import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { panel } from '@/api/services';
import { formatDate, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useUI } from '@/store/ui';
import type { Coupon } from '@/types';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Empty, Table, Td, Th } from '@/components/common';
import { Button, Input, Modal, Select, Skeleton } from '@/components/ui';

export default function CouponsPage() {
  useDocumentTitle('Coupons');
  const qc = useQueryClient();
  const toast = useUI((s) => s.toast);
  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: panel.coupons });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Partial<Coupon>>({ type: 'PERCENT', value: 10 });
  const save = useMutation({ mutationFn: () => panel.saveCoupon(f), onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setOpen(false); toast({ message: 'Coupon saved', kind: 'success' }); } });
  const toggle = useMutation({ mutationFn: (c: Coupon) => panel.saveCoupon({ id: c.id, active: !c.active }), onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }) });
  const set = (k: keyof Coupon, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  return (
    <div>
      <PageHeader title="Coupons" subtitle="Vendor coupons apply only to your products and are funded by you." actions={<Button onClick={() => { setF({ type: 'PERCENT', value: 10, startsAt: new Date().toISOString().slice(0, 10), endsAt: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) }); setOpen(true); }}><Plus className="h-4 w-4" /> New coupon</Button>} />
      {isLoading ? <Skeleton className="h-64 rounded-lg" /> : !data?.length ? <Empty title="No coupons yet" /> : (
        <Table><thead><tr><Th>Code</Th><Th>Discount</Th><Th>Conditions</Th><Th>Valid</Th><Th right>Used</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>{data.map((c) => <tr key={c.id}><Td><span className="font-semibold tabular text-ink-900">{c.code}</span></Td><Td>{c.type === 'PERCENT' ? `${c.value}% off${c.maxDiscount ? `, up to ${formatINR(c.maxDiscount)}` : ''}` : c.type === 'FLAT' ? `${formatINR(c.value)} off` : 'Free shipping'}</Td><Td className="text-ink-700">{c.minOrder ? `Min order ${formatINR(c.minOrder)}` : 'No minimum'}</Td><Td className="text-ink-700 whitespace-nowrap">{formatDate(c.startsAt)} to {formatDate(c.endsAt)}</Td><Td right className="tabular">{c.used}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</Td><Td><span className={`text-caption font-semibold ${c.active ? 'text-success-700' : 'text-ink-400'}`}>{c.active ? 'Active' : 'Paused'}</span></Td><Td right><Button size="sm" variant="ghost" onClick={() => toggle.mutate(c)}>{c.active ? 'Pause' : 'Activate'}</Button></Td></tr>)}</tbody></Table>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New coupon" footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={save.isPending} disabled={!f.code || !f.value} onClick={() => save.mutate()}>Create coupon</Button></div>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Code" className="sm:col-span-2 [&_input]:uppercase" placeholder="e.g. FIRSTFLUSH10" value={f.code ?? ''} onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
          <Select label="Type" value={f.type} onChange={(e) => set('type', e.target.value)}><option value="PERCENT">Percentage off</option><option value="FLAT">Flat amount off</option><option value="FREE_SHIPPING">Free shipping</option></Select>
          {f.type !== 'FREE_SHIPPING' && <Input label={f.type === 'PERCENT' ? 'Percent' : 'Amount (Rs)'} type="number" value={f.value ?? ''} onChange={(e) => set('value', Number(e.target.value))} />}
          <Input label="Minimum order (Rs)" type="number" value={f.minOrder ?? ''} onChange={(e) => set('minOrder', Number(e.target.value) || undefined)} />
          {f.type === 'PERCENT' && <Input label="Max discount (Rs)" type="number" value={f.maxDiscount ?? ''} onChange={(e) => set('maxDiscount', Number(e.target.value) || undefined)} />}
          <Input label="Starts" type="date" value={f.startsAt?.slice(0, 10) ?? ''} onChange={(e) => set('startsAt', e.target.value)} />
          <Input label="Ends" type="date" value={f.endsAt?.slice(0, 10) ?? ''} onChange={(e) => set('endsAt', e.target.value)} />
          <Input label="Usage limit" type="number" value={f.usageLimit ?? ''} onChange={(e) => set('usageLimit', Number(e.target.value) || undefined)} hint="Leave blank for unlimited" />
        </div>
      </Modal>
    </div>
  );
}
