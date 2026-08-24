import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, Plus, ShieldCheck } from 'lucide-react';
import { onboarding } from '@/api/services';
import { cn, formatDate } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Button, Input, Modal, Select } from '@/components/ui';

export default function CertificatesPage() {
  useDocumentTitle('GI Certificates');
  const { vendor, setVendor } = useAuth();
  const v = vendor!;
  const toast = useUI((s) => s.toast);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ giTag: '', certificateNumber: '', issuedBy: '', issuedAt: '', expiresAt: '', file: null as File | null });
  const add = useMutation({ mutationFn: () => onboarding.addCertificate(v.id, { giTag: f.giTag, certificateNumber: f.certificateNumber, issuedBy: f.issuedBy, issuedAt: f.issuedAt, expiresAt: f.expiresAt, fileName: f.file?.name }), onSuccess: (nv) => { setVendor(nv); setOpen(false); toast({ message: 'Certificate submitted for verification', kind: 'success' }); } });
  const daysLeft = (d: string) => Math.round((new Date(d).getTime() - Date.now()) / 864e5);
  return (
    <div>
      <PageHeader title="GI Certificates" subtitle="Certificates of authorised use. Renew at least 30 days before expiry to keep GI listings live." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add certificate</Button>} />
      <div className="grid md:grid-cols-2 gap-4">
        {v.giCertificates.map((c) => { const d = daysLeft(c.expiresAt); return (
          <div key={c.id} className={cn('rounded-lg bg-white border p-4', c.status === 'VERIFIED' ? 'border-border-strong' : c.status === 'REJECTED' ? 'border-error-600/40' : 'border-info-600/30')}>
            <div className="flex items-start gap-3"><span className={cn('h-10 w-10 rounded-md inline-flex items-center justify-center shrink-0', c.status === 'VERIFIED' ? 'bg-success-50 text-success-600' : 'bg-info-50 text-info-600')}><ShieldCheck className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="text-body font-semibold text-ink-900">{c.giTag}</div><div className="text-caption text-ink-500 tabular">{c.certificateNumber}</div></div><span className={cn('text-caption font-semibold', c.status === 'VERIFIED' ? 'text-success-700' : c.status === 'REJECTED' ? 'text-error-700' : 'text-info-600')}>{c.status === 'PENDING' ? 'In review' : c.status.charAt(0) + c.status.slice(1).toLowerCase()}</span></div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1 text-body-sm"><dt className="text-ink-500">Issued by</dt><dd className="text-ink-900">{c.issuedBy}</dd><dt className="text-ink-500">Valid</dt><dd className="text-ink-900">{formatDate(c.issuedAt)} to {formatDate(c.expiresAt)}</dd><dt className="text-ink-500">File</dt><dd className="text-ink-900 inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {c.fileName ?? 'none'}</dd></dl>
            {c.note && <p className="mt-2 text-caption text-error-700">{c.note}</p>}
            {d <= 90 && d > 0 && <div className="mt-3 rounded-md bg-warning-50 px-3 py-2 text-caption text-warning-600 font-medium">Expires in {d} days. Upload the renewed certificate to avoid listings going offline.</div>}
            {d <= 0 && <div className="mt-3 rounded-md bg-error-50 px-3 py-2 text-caption text-error-700 font-medium">Expired. GI listings under this certificate are hidden until renewed.</div>}
            <Button size="sm" variant="outline" className="mt-3" onClick={() => { setF({ ...f, giTag: c.giTag, issuedBy: c.issuedBy }); setOpen(true); }}>Upload renewal</Button>
          </div>
        ); })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add GI certificate" footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={add.isPending} disabled={!f.giTag || !f.certificateNumber || !f.issuedBy || !f.issuedAt || !f.expiresAt || !f.file} onClick={() => add.mutate()}>Submit</Button></div>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="GI tag" className="sm:col-span-2" value={f.giTag} onChange={(e) => setF({ ...f, giTag: e.target.value })}><option value="">Select</option>{['Darjeeling Tea', 'Kanchipuram Silk', 'Kashmir Pashmina', 'Kashmir Saffron', 'Alphonso Mango', 'Mysore Sandalwood Oil', 'Banarasi Brocade & Saree', 'Channapatna Toys', 'Bikaneri Bhujia', 'Madhubani Painting', 'Kolhapuri Chappal', 'Kutch Embroidery', 'Coorg Arabica Coffee', 'Kashmir Walnut Wood Carving'].map((g) => <option key={g}>{g}</option>)}</Select>
          <Input label="Certificate number" value={f.certificateNumber} onChange={(e) => setF({ ...f, certificateNumber: e.target.value })} />
          <Input label="Issued by" value={f.issuedBy} onChange={(e) => setF({ ...f, issuedBy: e.target.value })} />
          <Input label="Issue date" type="date" value={f.issuedAt} onChange={(e) => setF({ ...f, issuedAt: e.target.value })} />
          <Input label="Valid until" type="date" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
          <label className="sm:col-span-2 h-12 rounded-md border border-dashed border-border-input bg-white flex items-center justify-center gap-2 text-body-sm text-ink-700 cursor-pointer hover:bg-cream-50"><FileText className="h-4 w-4" /> {f.file ? f.file.name : 'Choose PDF or image'}<input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => setF({ ...f, file: e.target.files?.[0] ?? null })} /></label>
        </div>
      </Modal>
    </div>
  );
}
