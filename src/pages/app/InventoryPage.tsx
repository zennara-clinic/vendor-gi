import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { panel } from '@/api/services';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useUI } from '@/store/ui';
import type { Product, Variant } from '@/types';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Table, Td, Th } from '@/components/common';
import { Button, Img, Input, Modal, Select, Skeleton } from '@/components/ui';

export default function InventoryPage() {
  useDocumentTitle('Inventory');
  const qc = useQueryClient();
  const toast = useUI((s) => s.toast);
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: panel.products });
  const [edit, setEdit] = useState<{ p: Product; variantId: string | null; current: number } | null>(null);
  const [stock, setStock] = useState(0);
  const [reason, setReason] = useState('Restock');
  const mut = useMutation({ mutationFn: () => panel.updateStock(edit!.p.id, edit!.variantId, stock, reason), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setEdit(null); toast({ message: 'Stock updated', kind: 'success' }); } });
  const rows = (data ?? []).filter((p) => p.status !== 'ARCHIVED' && p.status !== 'DRAFT').flatMap((p): { p: Product; v: Variant | null }[] => (p.variants.length ? p.variants.map((v) => ({ p, v })) : [{ p, v: null }]));
  const low = rows.filter((r) => (r.v?.stock ?? r.p.stock) <= r.p.lowStockAt);
  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock changes are logged with a reason for your audit trail." />
      {low.length > 0 && <div className="mb-4 rounded-md bg-warning-50 border border-warning-400 px-4 py-3 text-body-sm text-ink-700 inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-600" /> {low.length} item{low.length > 1 ? 's are' : ' is'} at or below the low-stock level.</div>}
      {isLoading ? <Skeleton className="h-80 rounded-lg" /> : (
        <Table><thead><tr><Th>Product</Th><Th>Variant</Th><Th>SKU</Th><Th right>In stock</Th><Th right>Alert at</Th><Th></Th></tr></thead>
          <tbody>{rows.map(({ p, v }) => { const s = v?.stock ?? p.stock; const isLow = s <= p.lowStockAt; return (
            <tr key={`${p.id}-${v?.id ?? 'base'}`} className="hover:bg-cream-50">
              <Td><div className="flex items-center gap-3"><Img src={p.images[0] ?? '/placeholder.svg'} alt="" className="h-10 w-10 rounded-md object-cover bg-cream-200" /><span className="text-ink-900 line-clamp-1 max-w-[320px]">{p.title}</span></div></Td>
              <Td className="text-ink-700">{v?.title ?? 'Single'}</Td><Td className="text-ink-700 tabular">{v?.sku ?? p.sku}</Td>
              <Td right><span className={cn('font-semibold tabular', s === 0 ? 'text-error-700' : isLow ? 'text-warning-600' : 'text-ink-900')}>{s}</span></Td>
              <Td right className="text-ink-500">{p.lowStockAt}</Td>
              <Td right><Button size="sm" variant="outline" onClick={() => { setEdit({ p, variantId: v?.id ?? null, current: s }); setStock(s); }}>Update</Button></Td>
            </tr>
          ); })}</tbody></Table>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Update stock" size="sm" footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button loading={mut.isPending} onClick={() => mut.mutate()}>Save</Button></div>}>
        {edit && <div className="space-y-4"><p className="text-body text-ink-700 line-clamp-2">{edit.p.title}{edit.variantId ? `, ${edit.p.variants.find((v) => v.id === edit.variantId)?.title}` : ''}</p><Input label="New stock level" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} hint={`Currently ${edit.current}`} /><Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>{['Restock', 'Sale outside platform', 'Damage', 'Stock count adjustment', 'Reserved'].map((r) => <option key={r}>{r}</option>)}</Select></div>}
      </Modal>
    </div>
  );
}
