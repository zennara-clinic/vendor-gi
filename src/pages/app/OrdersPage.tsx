import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Download, Search } from 'lucide-react';
import { panel } from '@/api/services';
import { formatDate, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import type { OrderStatus } from '@/types';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Empty, OrderStatusPill, Table, Tabs, Td, Th } from '@/components/common';
import { Button, Img, Input, Skeleton } from '@/components/ui';

const TABS: { key: string; label: string; match: OrderStatus[] | null }[] = [
  { key: 'all', label: 'All', match: null }, { key: 'NEW', label: 'New', match: ['NEW'] }, { key: 'CONFIRMED', label: 'To pack', match: ['CONFIRMED'] }, { key: 'PACKED', label: 'Ready to ship', match: ['PACKED'] },
  { key: 'SHIPPED', label: 'Shipped', match: ['SHIPPED', 'OUT_FOR_DELIVERY'] }, { key: 'DELIVERED', label: 'Delivered', match: ['DELIVERED'] }, { key: 'CANCELLED', label: 'Cancelled', match: ['CANCELLED', 'RETURNED'] },
];
export default function OrdersPage() {
  useDocumentTitle('Orders');
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'all';
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: panel.orders });
  const match = TABS.find((t) => t.key === tab)?.match ?? null;
  const list = (data ?? []).filter((o) => !match || match.includes(o.status)).filter((o) => !q || o.number.toLowerCase().includes(q.toLowerCase()) || o.customer.name.toLowerCase().includes(q.toLowerCase()) || o.shipment?.awb.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Orders" subtitle="Confirm new orders within 24 hours to keep your seller rating." actions={<><Input placeholder="Order no., customer or AWB" leading={<Search />} value={q} onChange={(e) => setQ(e.target.value)} className="w-64" /><Button variant="outline"><Download className="h-4 w-4" /> Export</Button></>} />
      <Tabs tabs={TABS.map((t) => ({ key: t.key, label: t.label, count: t.match ? (data ?? []).filter((o) => t.match!.includes(o.status)).length : undefined }))} value={tab} onChange={(k) => setSp(k === 'all' ? {} : { tab: k })} />
      {isLoading ? <Skeleton className="h-80 rounded-lg" /> : list.length === 0 ? <Empty title="No orders here" body="Orders matching this filter will appear as they come in." /> : (
        <Table>
          <thead><tr><Th>Order</Th><Th>Items</Th><Th>Customer</Th><Th>Placed</Th><Th>Status</Th><Th right>Total</Th><Th right>Your earning</Th></tr></thead>
          <tbody>{list.map((o) => (
            <tr key={o.id} className="hover:bg-cream-50">
              <Td><Link to={`/orders/${o.id}`} className="font-medium text-ink-900 tabular hover:text-accent-700">{o.number}</Link>{o.status === 'NEW' && o.slaDueAt && <div className="text-micro text-warning-600 inline-flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> Confirm in {Math.max(1, Math.round((new Date(o.slaDueAt).getTime() - Date.now()) / 36e5))}h</div>}{o.payment === 'COD' && <div className="text-micro text-ink-500">Cash on delivery</div>}</Td>
              <Td><div className="flex items-center gap-2"><div className="flex -space-x-2">{o.items.slice(0, 3).map((it) => <Img key={it.id} src={it.image} alt="" className="h-9 w-9 rounded-md object-cover border-2 border-white bg-cream-200" />)}</div><span className="text-body-sm text-ink-700 line-clamp-1 max-w-[220px]">{o.items[0]?.title}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</span></div></Td>
              <Td><div className="text-ink-900">{o.customer.name}</div><div className="text-caption text-ink-500">{o.address.city}, {o.address.state}</div></Td>
              <Td className="text-ink-700 whitespace-nowrap">{formatDate(o.placedAt)}</Td>
              <Td><OrderStatusPill s={o.status} /></Td>
              <Td right className="font-semibold text-ink-900">{formatINR(o.total)}</Td>
              <Td right className="text-success-700 font-medium">{formatINR(o.netEarning)}</Td>
            </tr>
          ))}</tbody>
        </Table>
      )}
    </div>
  );
}
