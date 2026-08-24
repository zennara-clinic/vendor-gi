import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Flag, MessageSquare } from 'lucide-react';
import { panel } from '@/api/services';
import { formatDate } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useUI } from '@/store/ui';
import { PageHeader } from '@/components/layout/PanelLayout';
import { StatCard } from '@/components/common';
import { Button, RatingChip, Skeleton, Textarea } from '@/components/ui';

export default function ReviewsPage() {
  useDocumentTitle('Reviews');
  const qc = useQueryClient();
  const toast = useUI((s) => s.toast);
  const { data } = useQuery({ queryKey: ['reviews'], queryFn: panel.reviews });
  const [replying, setReplying] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const reply = useMutation({ mutationFn: (id: string) => panel.replyReview(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); setReplying(null); setBody(''); toast({ message: 'Reply posted', kind: 'success' }); } });
  if (!data) return <Skeleton className="h-80 rounded-lg" />;
  const avg = data.reduce((a, r) => a + r.rating, 0) / (data.length || 1);
  return (
    <div>
      <PageHeader title="Reviews" subtitle="You can post one public reply per review. Keep it short and helpful." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6"><StatCard label="Average rating" value={avg.toFixed(1)} sub={`${data.length} reviews`} /><StatCard label="Awaiting reply" value={data.filter((r) => !r.reply).length} /><StatCard label="Low ratings (3 and below)" value={data.filter((r) => r.rating <= 3).length} tone="warning" /></div>
      <ul className="space-y-3">{data.map((r) => (
        <li key={r.id} className="rounded-lg bg-white border border-border-strong p-4">
          <div className="flex items-start gap-3 flex-wrap"><RatingChip rating={r.rating} size="md" /><div className="min-w-0 flex-1"><div className="text-body font-semibold text-ink-900">{r.title ?? 'Review'}</div><div className="text-caption text-ink-500">{r.customer}{r.verified && <span className="inline-flex items-center gap-0.5 text-success-700 ml-2"><BadgeCheck className="h-3.5 w-3.5" /> Verified purchase</span>}, {formatDate(r.at)}</div></div><button onClick={() => toast({ message: 'Reported to moderation', kind: 'info' })} className="text-caption text-ink-400 hover:text-ink-700 inline-flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> Report</button></div>
          <p className="text-body text-ink-700 mt-2">{r.body}</p>
          <div className="text-caption text-ink-500 mt-1">On: {r.productTitle}</div>
          {r.reply ? <div className="mt-3 ml-3 pl-3 border-l-2 border-accent-200"><div className="text-caption font-semibold text-ink-700">Your reply, {formatDate(r.reply.at)}</div><p className="text-body-sm text-ink-700 mt-0.5">{r.reply.body}</p></div>
          : replying === r.id ? <div className="mt-3 space-y-2"><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Thank the customer, address the issue, and say what you will do." /><div className="flex gap-2"><Button size="sm" loading={reply.isPending} disabled={body.length < 10} onClick={() => reply.mutate(r.id)}>Post reply</Button><Button size="sm" variant="ghost" onClick={() => setReplying(null)}>Cancel</Button></div></div>
          : <Button size="sm" variant="outline" className="mt-3" onClick={() => { setReplying(r.id); setBody(''); }}><MessageSquare className="h-4 w-4" /> Reply</Button>}
        </li>
      ))}</ul>
    </div>
  );
}
