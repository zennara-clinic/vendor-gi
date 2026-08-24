import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useUI } from '@/store/ui';
const FAQ = [['How long does product review take?', 'Usually within 2 business days. GI products are checked against your verified certificate.'], ['When do I get paid?', 'Every Monday, for orders delivered at least 7 days earlier (the return window). TDS is deducted and a certificate is issued quarterly.'], ['Can I change a live listing?', 'Price and stock change instantly. Title, images and descriptions go through a quick re-review.'], ['What happens when my GI certificate expires?', 'Listings under that certificate are hidden until you upload the renewal. We remind you 90, 60, 30 and 7 days before.']];
export default function HelpPage() {
  useDocumentTitle('Seller help');
  const toast = useUI((s) => s.toast);
  return (
    <div>
      <PageHeader title="Seller help" subtitle="Seller support replies within one business day." />
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <section className="rounded-lg bg-white border border-border-strong divide-y divide-border-subtle">{FAQ.map(([q, a]) => <div key={q} className="p-4"><div className="text-body font-semibold text-ink-900">{q}</div><p className="text-body-sm text-ink-700 mt-1">{a}</p></div>)}</section>
        <form onSubmit={(e) => { e.preventDefault(); toast({ message: 'Ticket created. We reply within one business day.', kind: 'success' }); }} className="rounded-lg bg-white border border-border-strong p-4 md:p-6 space-y-3"><h2 className="text-h4 text-ink-900">Raise a ticket</h2><Select label="Topic" required><option value="">Select</option>{['Orders and shipping', 'Payouts and tax', 'Product review', 'GI certificate', 'Account', 'Other'].map((t) => <option key={t}>{t}</option>)}</Select><Input label="Order or product reference (optional)" /><Textarea label="Message" required rows={5} /><Button type="submit">Submit</Button></form>
      </div>
    </div>
  );
}
