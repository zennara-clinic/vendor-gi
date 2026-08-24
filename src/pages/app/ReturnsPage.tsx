import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { panel } from '@/api/services';
import { formatDate, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Empty, Table, Td, Th } from '@/components/common';
import { Button, Skeleton } from '@/components/ui';
export default function ReturnsPage() {
  useDocumentTitle('Returns');
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: panel.orders });
  const list = (data ?? []).filter((o) => o.returnRequest);
  return (
    <div>
      <PageHeader title="Returns" subtitle="Respond within 48 hours. Approved returns get a free reverse pickup." />
      {isLoading ? <Skeleton className="h-64 rounded-lg" /> : list.length === 0 ? <Empty title="No return requests" body="That is a good sign." /> : (
        <Table><thead><tr><Th>Order</Th><Th>Reason</Th><Th>Type</Th><Th>Requested</Th><Th>Status</Th><Th right>Amount</Th><Th></Th></tr></thead>
          <tbody>{list.map((o) => <tr key={o.id}><Td className="font-medium tabular">{o.number}</Td><Td><div className="text-ink-900">{o.returnRequest!.reason}</div>{o.returnRequest!.note && <div className="text-caption text-ink-500 line-clamp-1">{o.returnRequest!.note}</div>}</Td><Td>{o.returnRequest!.type === 'REFUND' ? 'Refund' : 'Replacement'}</Td><Td>{formatDate(o.returnRequest!.requestedAt)}</Td><Td><span className="text-caption font-semibold text-ink-700">{o.returnRequest!.status.toLowerCase().replace('_', ' ')}</span></Td><Td right className="font-semibold">{formatINR(o.total)}</Td><Td right><Link to={`/orders/${o.id}`}><Button size="sm" variant={o.returnRequest!.status === 'REQUESTED' ? 'primary' : 'outline'}>{o.returnRequest!.status === 'REQUESTED' ? 'Respond' : 'View'}</Button></Link></Td></tr>)}</tbody></Table>
      )}
    </div>
  );
}
