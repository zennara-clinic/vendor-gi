import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, FileSearch, LogOut, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { onboarding } from '@/api/services';
import { useAuth } from '@/store/auth';
import { useDocumentTitle } from '@/hooks';
import { Button, InlineBanner } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
import { DocumentUpload } from '@/components/DocumentUpload';

export default function StatusPage() {
  useDocumentTitle('Application status');
  const { vendor, setVendor, logout } = useAuth();
  const v = vendor!;
  const navigate = useNavigate();
  const sim = useMutation({ mutationFn: (o: 'APPROVED' | 'CHANGES_REQUESTED') => onboarding.simulateReview(v.id, o), onSuccess: setVendor });
  const resubmit = useMutation({ mutationFn: () => onboarding.resubmit(v.id), onSuccess: setVendor });
  const steps = [{ t: 'Submitted', d: v.submittedAt ? formatDate(v.submittedAt) : '' }, { t: 'Document check', d: 'KYC and GST' }, { t: 'GI certificate review', d: 'Verification officer' }, { t: 'Store approved', d: 'Start listing' }];
  const idx = v.status === 'PENDING' ? 1 : v.status === 'UNDER_REVIEW' ? 2 : v.status === 'APPROVED' ? 4 : 1;
  const head = v.status === 'CHANGES_REQUESTED' ? { icon: AlertTriangle, tone: 'warning', title: 'We need a small change', sub: 'Our verification team has reviewed your application.' }
    : v.status === 'REJECTED' ? { icon: XCircle, tone: 'error', title: 'Application not approved', sub: 'See the note below and contact seller support if you think this is a mistake.' }
    : v.status === 'SUSPENDED' ? { icon: XCircle, tone: 'error', title: 'Store suspended', sub: 'Contact seller support to resolve this.' }
    : { icon: Clock, tone: 'info', title: 'Application under verification', sub: 'Usually completed within 3 business days. We will email and SMS you.' };
  return (
    <AuthShell wide title={head.title} subtitle={head.sub} footer={<button onClick={() => { logout(); navigate('/login'); }} className="inline-flex items-center gap-1.5 text-ink-500 hover:text-ink-900"><LogOut className="h-4 w-4" /> Log out</button>}>
      {v.status === 'CHANGES_REQUESTED' && <InlineBanner tone="warning" className="mb-4"><b>Reviewer note:</b> {v.statusNote}</InlineBanner>}
      {v.status === 'REJECTED' && <InlineBanner tone="error" className="mb-4">{v.statusNote ?? 'Your documents could not be verified.'}</InlineBanner>}
      {(v.status === 'PENDING' || v.status === 'UNDER_REVIEW') && (
        <ol className="relative border-l-2 border-cream-300 ml-3 space-y-5 mb-6">
          {steps.map((s, i) => (
            <li key={s.t} className="pl-5 relative"><span className={`absolute -left-[11px] top-0 h-5 w-5 rounded-full inline-flex items-center justify-center ${i < idx ? 'bg-success-600 text-white' : i === idx ? 'bg-accent-600 text-white' : 'bg-cream-300'}`}>{i < idx ? <CheckCircle2 className="h-3.5 w-3.5" /> : i === idx ? <FileSearch className="h-3 w-3" /> : null}</span><div className={`text-body ${i <= idx ? 'text-ink-900 font-medium' : 'text-ink-400'}`}>{s.t}</div><div className="text-caption text-ink-500">{s.d}</div></li>
          ))}
        </ol>
      )}
      {v.status === 'CHANGES_REQUESTED' && (
        <div className="space-y-3 mb-4">
          {v.giCertificates.filter((c) => c.status === 'REJECTED').map((c) => <div key={c.id} className="rounded-lg border border-error-600/40 bg-white p-4"><div className="text-body font-semibold text-ink-900">{c.giTag} certificate</div><div className="text-caption text-error-700 mt-0.5">{c.note}</div><label className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-accent-600 px-4 text-body-sm font-semibold text-accent-600 cursor-pointer hover:bg-accent-50">Upload a clearer copy<input type="file" accept=".pdf,image/*" className="sr-only" onChange={() => setVendor({ ...v, giCertificates: v.giCertificates.map((x) => (x.id === c.id ? { ...x, status: 'PENDING', note: undefined, fileName: 'certificate-rescan.pdf' } : x)) })} /></label></div>)}
          {v.documents.filter((d) => d.status === 'REJECTED').map((d) => <DocumentUpload key={d.type} doc={d} label={d.type.replace('_', ' ')} hint="Replace the rejected file" onUpload={async (f) => setVendor(await onboarding.uploadDocument(v.id, d.type, f))} />)}
          <Button size="lg" full loading={resubmit.isPending} disabled={v.giCertificates.some((c) => c.status === 'REJECTED') || v.documents.some((d) => d.status === 'REJECTED')} onClick={() => resubmit.mutate()}>Resubmit for verification</Button>
        </div>
      )}
      <div className="rounded-lg bg-cream-100 p-4 text-body-sm text-ink-700">
        <div className="font-semibold text-ink-900 mb-1">While you wait</div>
        Read the <a href={`${import.meta.env.VITE_STORE_URL ?? ''}/policy/seller-agreement`} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline">seller agreement</a>, prepare product photos on a white background, and keep your HSN codes and net weights handy for listing.
      </div>
      {import.meta.env.DEV && (v.status === 'PENDING' || v.status === 'UNDER_REVIEW') && (
        <div className="mt-6 rounded-md border border-dashed border-border-strong p-3 text-caption text-ink-500">
          <div className="font-semibold text-ink-700 mb-2">Development only: simulate the admin decision</div>
          <div className="flex gap-2"><Button size="sm" variant="tonal" loading={sim.isPending} onClick={() => sim.mutate('APPROVED')}>Approve</Button><Button size="sm" variant="outline" loading={sim.isPending} onClick={() => sim.mutate('CHANGES_REQUESTED')}>Request changes</Button></div>
        </div>
      )}
      {v.status === 'APPROVED' && <Button size="lg" full className="mt-4" onClick={() => navigate('/dashboard')}>Go to your dashboard</Button>}
    </AuthShell>
  );
}
