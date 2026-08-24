import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Pencil, Plus, Search, Upload } from 'lucide-react';
import { panel } from '@/api/services';
import { formatCount, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useUI } from '@/store/ui';
import type { ProductStatus } from '@/types';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Empty, ProductStatusPill, Table, Tabs, Td, Th } from '@/components/common';
import { Button, Img, Input, RatingChip, Skeleton } from '@/components/ui';

const TABS: { key: string; label: string; match: ProductStatus[] | null }[] = [{ key: 'all', label: 'All', match: null }, { key: 'live', label: 'Live', match: ['APPROVED'] }, { key: 'review', label: 'In review', match: ['PENDING_REVIEW'] }, { key: 'action', label: 'Needs action', match: ['CHANGES_REQUIRED', 'REJECTED', 'OUT_OF_STOCK'] }, { key: 'draft', label: 'Drafts', match: ['DRAFT'] }, { key: 'archived', label: 'Archived', match: ['ARCHIVED', 'INACTIVE'] }];
export default function ProductsPage() {
  useDocumentTitle('Products');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: panel.products });
  const archive = useMutation({ mutationFn: panel.archiveProduct, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast({ message: 'Product archived', kind: 'info' }); } });
  const match = TABS.find((t) => t.key === tab)?.match ?? null;
  const list = (data ?? []).filter((p) => (match ? match.includes(p.status) : p.status !== 'ARCHIVED')).filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Products" subtitle="Approved listings can only change price and stock without re-review." actions={<><Input placeholder="Search title or SKU" leading={<Search />} value={q} onChange={(e) => setQ(e.target.value)} className="w-56" /><Button variant="outline" onClick={() => toast({ message: 'Bulk CSV upload opens once the server is connected', kind: 'info' })}><Upload className="h-4 w-4" /> Bulk upload</Button><Button onClick={() => navigate('/products/new')}><Plus className="h-4 w-4" /> Add product</Button></>} />
      <Tabs tabs={TABS.map((t) => ({ key: t.key, label: t.label, count: t.match ? (data ?? []).filter((p) => t.match!.includes(p.status)).length : undefined }))} value={tab} onChange={setTab} />
      {isLoading ? <Skeleton className="h-80 rounded-lg" /> : list.length === 0 ? <Empty title="No products here" action={<Link to="/products/new"><Button><Plus className="h-4 w-4" /> Add your first product</Button></Link>} /> : (
        <Table><thead><tr><Th>Product</Th><Th>Class</Th><Th>Status</Th><Th right>Price</Th><Th right>Stock</Th><Th right>Sold</Th><Th>Rating</Th><Th></Th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id} className="hover:bg-cream-50">
              <Td><Link to={`/products/${p.id}`} className="flex items-center gap-3 group"><Img src={p.images[0] ?? '/placeholder.svg'} alt="" className="h-12 w-12 rounded-md object-cover bg-cream-200 shrink-0" /><span className="min-w-0"><span className="block text-ink-900 line-clamp-1 group-hover:text-accent-700">{p.title}</span><span className="block text-caption text-ink-500 tabular">SKU {p.sku || 'not set'}{p.variants.length ? `, ${p.variants.length} variants` : ''}</span></span></Link></Td>
              <Td><span className="text-caption font-medium text-ink-700">{p.productClass === 'GI' ? p.giTag ?? 'GI' : p.productClass === 'HERITAGE' ? 'Heritage' : 'Tradition'}</span></Td>
              <Td><ProductStatusPill s={p.status} />{p.reviewNote && <div className="text-micro text-warning-600 mt-0.5 max-w-[200px] line-clamp-1">{p.reviewNote}</div>}</Td>
              <Td right className="font-semibold text-ink-900">{formatINR(p.price)}</Td>
              <Td right className={p.stock === 0 ? 'text-error-700 font-semibold' : p.stock <= p.lowStockAt ? 'text-warning-600 font-semibold' : 'text-ink-900'}>{p.stock}</Td>
              <Td right className="text-ink-700">{formatCount(p.sold ?? 0)}</Td>
              <Td>{p.rating ? <RatingChip rating={p.rating} count={p.ratingCount} /> : <span className="text-caption text-ink-400">No ratings</span>}</Td>
              <Td right><div className="inline-flex gap-1"><Link to={`/products/${p.id}`} aria-label="Edit" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-500 hover:bg-cream-200"><Pencil className="h-4 w-4" /></Link>{p.status !== 'ARCHIVED' && <button aria-label="Archive" onClick={() => archive.mutate(p.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-500 hover:bg-cream-200"><Archive className="h-4 w-4" /></button>}</div></Td>
            </tr>
          ))}</tbody></Table>
      )}
    </div>
  );
}
