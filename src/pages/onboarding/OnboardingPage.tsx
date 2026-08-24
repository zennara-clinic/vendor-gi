import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Check, FileCheck, Landmark, Plus, ShieldCheck, Store, Trash2, FileText } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { onboarding } from '@/api/services';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { useDocumentTitle } from '@/hooks';
import type { DocType, Vendor } from '@/types';
import { Button, Checkbox, InlineBanner, Input, Select } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
import { DocumentUpload } from '@/components/DocumentUpload';

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jammu & Kashmir', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
const GI_TAGS = ['Darjeeling Tea', 'Kanchipuram Silk', 'Kashmir Pashmina', 'Kashmir Saffron', 'Alphonso Mango', 'Mysore Sandalwood Oil', 'Banarasi Brocade & Saree', 'Channapatna Toys', 'Bikaneri Bhujia', 'Madhubani Painting', 'Kolhapuri Chappal', 'Kutch Embroidery', 'Coorg Arabica Coffee', 'Kashmir Walnut Wood Carving', 'Other (specify in notes)'];
const DOCS: { type: DocType; label: string; hint: string }[] = [
  { type: 'GST_CERTIFICATE', label: 'GST registration certificate', hint: 'Form GST REG-06. PDF or image, up to 5 MB.' },
  { type: 'PAN', label: 'PAN card', hint: 'Business PAN, or personal PAN for individual artisans.' },
  { type: 'AADHAAR', label: 'Aadhaar of the authorised signatory', hint: 'Mask the first 8 digits if you prefer. Used only for identity verification.' },
  { type: 'ADDRESS_PROOF', label: 'Address proof of workshop or business', hint: 'Electricity bill, rent agreement or shop licence within the last 3 months.' },
  { type: 'BANK_PROOF', label: 'Bank proof', hint: 'Cancelled cheque or first page of passbook showing name, account number and IFSC.' },
];
const STEPS = [{ t: 'Business', i: Store }, { t: 'Documents', i: FileText }, { t: 'GI certificates', i: FileCheck }, { t: 'Bank', i: Landmark }, { t: 'Review', i: ShieldCheck }];

export default function OnboardingPage() {
  useDocumentTitle('Seller onboarding');
  const { vendor, setVendor } = useAuth();
  const v = vendor!;
  const [step, setStep] = useState(Math.min(Math.max(v.onboardingStep - 1, 0), 4));
  const go = (s: number) => { setStep(s); window.scrollTo({ top: 0 }); };
  return (
    <AuthShell wide title="Set up your store" subtitle="Tag Traditions verifies every seller before listing. This keeps the GI badge meaningful.">
      <ol className="grid grid-cols-5 gap-1 mb-6">
        {STEPS.map((st, i) => { const done = i < v.onboardingStep - 1; return (
          <li key={st.t} className="flex flex-col items-center text-center gap-1.5">
            <button type="button" disabled={i > v.onboardingStep - 1} onClick={() => go(i)} className={cn('h-9 w-9 rounded-full inline-flex items-center justify-center border-2 transition-colors', done ? 'bg-success-600 border-success-600 text-white' : i === step ? 'border-accent-600 text-accent-600 bg-accent-50' : 'border-cream-300 text-ink-300')}>{done ? <Check className="h-4 w-4" /> : <st.i className="h-4 w-4" />}</button>
            <span className={cn('text-caption', i === step ? 'text-ink-900 font-medium' : 'text-ink-500')}>{st.t}</span>
          </li>
        ); })}
      </ol>
      {step === 0 && <BusinessStep v={v} onDone={(nv) => { setVendor(nv); go(1); }} />}
      {step === 1 && <DocumentsStep v={v} setVendor={setVendor} onBack={() => go(0)} onDone={(nv) => { setVendor(nv); go(2); }} />}
      {step === 2 && <CertificatesStep v={v} setVendor={setVendor} onBack={() => go(1)} onDone={(nv) => { setVendor(nv); go(3); }} />}
      {step === 3 && <BankStep v={v} onBack={() => go(2)} onDone={(nv) => { setVendor(nv); go(4); }} />}
      {step === 4 && <ReviewStep v={v} onBack={() => go(3)} goTo={go} />}
    </AuthShell>
  );
}

/* ---------- Step 1: Business ---------- */
const bizSchema = z.object({
  businessName: z.string().min(2, 'Enter your business or co-operative name'), businessType: z.string().min(1, 'Select a type'),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/i, 'Enter a valid 15-character GSTIN'), pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/i, 'Enter a valid 10-character PAN'),
  line1: z.string().min(5, 'Enter the workshop or office address'), city: z.string().min(2, 'Enter city'), state: z.string().min(1, 'Select state'), pincode: z.string().regex(/^[1-9]\d{5}$/, 'Valid 6-digit pincode'),
  gi: z.boolean(), heritage: z.boolean(), tradition: z.boolean(),
}).refine((d) => d.gi || d.heritage || d.tradition, { message: 'Select at least one product class', path: ['gi'] })
  .refine((d) => d.gstin.slice(2, 12).toUpperCase() === d.pan.toUpperCase(), { message: 'PAN does not match characters 3 to 12 of the GSTIN', path: ['pan'] });
type Biz = z.infer<typeof bizSchema>;
function BusinessStep({ v, onDone }: { v: Vendor; onDone: (v: Vendor) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Biz>({ resolver: zodResolver(bizSchema), defaultValues: { businessName: v.businessName, businessType: v.businessType, gstin: v.gstin, pan: v.pan, line1: v.address.line1, city: v.address.city, state: v.address.state, pincode: v.address.pincode, gi: v.productClasses.includes('GI'), heritage: v.productClasses.includes('HERITAGE'), tradition: v.productClasses.includes('TRADITION') } });
  const mut = useMutation({ mutationFn: (d: Biz) => onboarding.saveBusiness(v.id, { businessName: d.businessName, businessType: d.businessType, gstin: d.gstin.toUpperCase(), pan: d.pan.toUpperCase(), address: { line1: d.line1, city: d.city, state: d.state, pincode: d.pincode }, productClasses: [d.gi && 'GI', d.heritage && 'HERITAGE', d.tradition && 'TRADITION'].filter(Boolean) as Vendor['productClasses'] }), onSuccess: onDone });
  return (
    <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="grid sm:grid-cols-2 gap-4">
      <Input label="Business or co-operative name" size="lg" className="sm:col-span-2" {...register('businessName')} error={errors.businessName?.message} />
      <Select label="Business type" {...register('businessType')} error={errors.businessType?.message}><option value="">Select</option>{['Individual artisan', 'Sole proprietorship', 'Partnership', 'Producer company or FPO', 'Co-operative society', 'Private limited company'].map((t) => <option key={t}>{t}</option>)}</Select>
      <Input label="GSTIN" size="lg" placeholder="15 characters" className="[&_input]:uppercase" {...register('gstin')} error={errors.gstin?.message} />
      <Input label="PAN" size="lg" placeholder="ABCDE1234F" className="[&_input]:uppercase" {...register('pan')} error={errors.pan?.message} hint="Must match your GSTIN" />
      <Input label="Workshop or office address" size="lg" className="sm:col-span-2" {...register('line1')} error={errors.line1?.message} />
      <Input label="City" size="lg" {...register('city')} error={errors.city?.message} />
      <Input label="Pincode" size="lg" inputMode="numeric" maxLength={6} {...register('pincode')} error={errors.pincode?.message} />
      <Select label="State" className="sm:col-span-2" {...register('state')} error={errors.state?.message}><option value="">Select state</option>{STATES.map((x) => <option key={x}>{x}</option>)}</Select>
      <div className="sm:col-span-2">
        <div className="text-body-sm font-medium text-ink-700 mb-2">What will you sell?</div>
        <div className="grid gap-2">
          <Checkbox {...register('gi')} label={<span><span className="font-medium text-ink-900">GI-tagged products</span> <span className="text-ink-500">(needs a certificate of authorised use, earns the GI Verified badge)</span></span>} />
          <Checkbox {...register('heritage')} label={<span><span className="font-medium text-ink-900">Heritage crafts, non-GI</span> <span className="text-ink-500">(provenance is disclosed and reviewed)</span></span>} />
          <Checkbox {...register('tradition')} label={<span><span className="font-medium text-ink-900">Tradition-based products</span> <span className="text-ink-500">(content accuracy review)</span></span>} />
        </div>
        {errors.gi && <p className="text-caption text-error-700 mt-1">{errors.gi.message}</p>}
      </div>
      <div className="sm:col-span-2"><Button type="submit" size="lg" full loading={mut.isPending}>Save and continue</Button></div>
    </form>
  );
}

/* ---------- Step 2: Documents ---------- */
function DocumentsStep({ v, setVendor, onBack, onDone }: { v: Vendor; setVendor: (v: Vendor) => void; onBack: () => void; onDone: (v: Vendor) => void }) {
  const allUp = v.documents.every((d) => d.status === 'UPLOADED' || d.status === 'VERIFIED');
  const mut = useMutation({ mutationFn: () => onboarding.completeDocuments(v.id), onSuccess: onDone });
  return (
    <div className="space-y-3">
      <InlineBanner tone="info">Documents are encrypted and seen only by our verification team. Automated reading helps pre-fill checks but never approves a seller on its own.</InlineBanner>
      {DOCS.map((d) => <DocumentUpload key={d.type} doc={v.documents.find((x) => x.type === d.type)!} label={d.label} hint={d.hint} onUpload={async (f) => setVendor(await onboarding.uploadDocument(v.id, d.type, f))} />)}
      <div className="flex gap-3 pt-2"><Button type="button" variant="ghost" size="lg" onClick={onBack}>Back</Button><Button size="lg" className="flex-1" disabled={!allUp} loading={mut.isPending} onClick={() => mut.mutate()}>{allUp ? 'Continue' : `Upload all ${DOCS.length} documents to continue`}</Button></div>
    </div>
  );
}

/* ---------- Step 3: GI certificates ---------- */
const certSchema = z.object({ giTag: z.string().min(1, 'Select the GI tag'), certificateNumber: z.string().min(3, 'Enter the certificate number'), issuedBy: z.string().min(2, 'Enter the issuing body'), issuedAt: z.string().min(1, 'Required'), expiresAt: z.string().min(1, 'Required') })
  .refine((d) => new Date(d.expiresAt).getTime() > Date.now() + 30 * 864e5, { message: 'Certificate must be valid for at least 30 more days', path: ['expiresAt'] });
type Cert = z.infer<typeof certSchema>;
function CertificatesStep({ v, setVendor, onBack, onDone }: { v: Vendor; setVendor: (v: Vendor) => void; onBack: () => void; onDone: (v: Vendor) => void }) {
  const sellsGI = v.productClasses.includes('GI');
  const [file, setFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(v.giCertificates.length === 0 && sellsGI);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Cert>({ resolver: zodResolver(certSchema) });
  const add = useMutation({ mutationFn: (d: Cert) => onboarding.addCertificate(v.id, { ...d, fileName: file?.name }), onSuccess: (nv) => { setVendor(nv); reset(); setFile(null); setAdding(false); } });
  const done = useMutation({ mutationFn: () => onboarding.completeCertificates(v.id), onSuccess: onDone });
  const canContinue = !sellsGI || v.giCertificates.length > 0;
  return (
    <div className="space-y-4">
      {!sellsGI && <InlineBanner tone="info">You chose not to sell GI-tagged products, so no certificate is needed. You can add one later from Settings.</InlineBanner>}
      {sellsGI && <p className="text-body text-ink-700">Upload the certificate of authorised use issued by the registered proprietor of each GI you sell. Our GI Verification Officer cross-checks it with the GI Registry.</p>}
      {v.giCertificates.map((c) => (
        <div key={c.id} className="rounded-lg border border-border-strong bg-white p-4 flex gap-3">
          <span className="h-10 w-10 rounded-md bg-info-50 text-info-600 inline-flex items-center justify-center shrink-0"><ShieldCheck className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><div className="text-body font-semibold text-ink-900">{c.giTag}</div><div className="text-caption text-ink-500 tabular">{c.certificateNumber}, {c.issuedBy}, valid {formatDate(c.issuedAt)} to {formatDate(c.expiresAt)}</div>{c.fileName && <div className="text-caption text-ink-700 mt-1 inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {c.fileName}</div>}</div>
          <button type="button" onClick={async () => setVendor(await onboarding.removeCertificate(v.id, c.id))} aria-label="Remove" className="h-9 w-9 rounded-full inline-flex items-center justify-center text-ink-400 hover:text-error-600 hover:bg-error-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={handleSubmit((d) => { if (!file) return; add.mutate(d); })} className="rounded-lg border border-accent-200 bg-accent-50/50 p-4 grid sm:grid-cols-2 gap-4">
          <Select label="GI tag" className="sm:col-span-2" {...register('giTag')} error={errors.giTag?.message}><option value="">Select the registered GI</option>{GI_TAGS.map((g) => <option key={g}>{g}</option>)}</Select>
          <Input label="Certificate number" size="lg" {...register('certificateNumber')} error={errors.certificateNumber?.message} />
          <Input label="Issued by" size="lg" placeholder="Registered proprietor, e.g. Tea Board of India" {...register('issuedBy')} error={errors.issuedBy?.message} />
          <Input label="Issue date" type="date" size="lg" {...register('issuedAt')} error={errors.issuedAt?.message} />
          <Input label="Valid until" type="date" size="lg" {...register('expiresAt')} error={errors.expiresAt?.message} />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-ink-700">Certificate file <span className="text-error-600">*</span></span>
            <label className={cn('h-12 rounded-md border border-dashed bg-white flex items-center justify-center gap-2 text-body-sm cursor-pointer hover:bg-cream-50', file ? 'border-success-600/50 text-success-700' : 'border-border-input text-ink-700')}>{file ? <><FileText className="h-4 w-4" /> {file.name}</> : <><Plus className="h-4 w-4" /> Choose PDF or image</>}<input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
            {!file && add.isError === false && <span className="text-caption text-ink-500">Required before saving</span>}
          </div>
          <div className="sm:col-span-2 flex gap-3">{v.giCertificates.length > 0 && <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>}<Button type="submit" loading={add.isPending} disabled={!file}>Save certificate</Button></div>
        </form>
      ) : sellsGI && <Button type="button" variant="outline" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add another GI certificate</Button>}
      <div className="flex gap-3 pt-2"><Button type="button" variant="ghost" size="lg" onClick={onBack}>Back</Button><Button size="lg" className="flex-1" disabled={!canContinue} loading={done.isPending} onClick={() => done.mutate()}>Continue</Button></div>
    </div>
  );
}

/* ---------- Step 4: Bank ---------- */
const bankSchema = z.object({ accountName: z.string().min(2, 'Enter the account holder name'), accountNumber: z.string().regex(/^\d{9,18}$/, 'Enter a valid account number'), confirm: z.string(), ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Enter a valid 11-character IFSC') }).refine((d) => d.accountNumber === d.confirm, { message: 'Account numbers do not match', path: ['confirm'] });
type Bank = z.infer<typeof bankSchema>;
function BankStep({ v, onBack, onDone }: { v: Vendor; onBack: () => void; onDone: (v: Vendor) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Bank>({ resolver: zodResolver(bankSchema), defaultValues: { accountName: v.bank?.accountName ?? v.businessName } });
  const mut = useMutation({ mutationFn: (d: Bank) => onboarding.saveBank(v.id, { accountName: d.accountName, accountNumber: d.accountNumber, ifsc: d.ifsc }), onSuccess: onDone });
  if (v.bank?.verified) return (
    <div className="space-y-4">
      <div className="rounded-lg border border-success-600/40 bg-white p-4 flex gap-3"><span className="h-10 w-10 rounded-md bg-success-50 text-success-600 inline-flex items-center justify-center shrink-0"><Check className="h-5 w-5" /></span><div><div className="text-body font-semibold text-ink-900">Bank account verified</div><div className="text-caption text-ink-500">{v.bank.accountName}, {v.bank.bankName}, {v.bank.accountNumber}, IFSC {v.bank.ifsc}</div></div></div>
      <div className="flex gap-3"><Button type="button" variant="ghost" size="lg" onClick={onBack}>Back</Button><Button size="lg" className="flex-1" onClick={() => onDone(v)}>Continue</Button></div>
    </div>
  );
  return (
    <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
      <p className="text-body text-ink-700">Payouts are sent weekly to this account after the return window closes. We verify it with a one rupee test transfer (penny drop).</p>
      <Input label="Account holder name" size="lg" {...register('accountName')} error={errors.accountName?.message} hint="Must match the name on your bank proof" />
      <div className="grid sm:grid-cols-2 gap-4"><Input label="Account number" size="lg" inputMode="numeric" {...register('accountNumber')} error={errors.accountNumber?.message} /><Input label="Re-enter account number" size="lg" inputMode="numeric" {...register('confirm')} error={errors.confirm?.message} /></div>
      <Input label="IFSC" size="lg" placeholder="SBIN0001234" className="[&_input]:uppercase" {...register('ifsc')} error={errors.ifsc?.message} />
      <div className="flex gap-3 pt-2"><Button type="button" variant="ghost" size="lg" onClick={onBack}>Back</Button><Button type="submit" size="lg" className="flex-1" loading={mut.isPending}>{mut.isPending ? 'Verifying account' : 'Verify and continue'}</Button></div>
    </form>
  );
}

/* ---------- Step 5: Review & submit ---------- */
function ReviewStep({ v, onBack, goTo }: { v: Vendor; onBack: () => void; goTo: (s: number) => void }) {
  const navigate = useNavigate();
  const setVendor = useAuth((s) => s.setVendor);
  const toast = useUI((s) => s.toast);
  const [agree, setAgree] = useState(false);
  const mut = useMutation({ mutationFn: () => onboarding.submit(v.id), onSuccess: (nv) => { setVendor(nv); toast({ message: 'Application submitted for verification', kind: 'success' }); navigate('/application-status', { replace: true }); } });
  const Row = ({ k, val }: { k: string; val: React.ReactNode }) => <div className="flex justify-between gap-4 py-1.5 text-body"><dt className="text-ink-500">{k}</dt><dd className="text-ink-900 text-right">{val}</dd></div>;
  const Card = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => <section className="rounded-lg border border-border-strong bg-white p-4"><div className="flex items-center justify-between mb-1"><h3 className="text-body font-semibold text-ink-900">{title}</h3><button type="button" onClick={() => goTo(step)} className="text-body-sm text-accent-600 hover:underline">Edit</button></div><dl className="divide-y divide-border-subtle">{children}</dl></section>;
  return (
    <div className="space-y-4">
      <Card title="Business" step={0}><Row k="Name" val={v.businessName} /><Row k="Type" val={v.businessType} /><Row k="GSTIN" val={<span className="tabular">{v.gstin}</span>} /><Row k="PAN" val={<span className="tabular">{v.pan}</span>} /><Row k="Address" val={`${v.address.line1}, ${v.address.city}, ${v.address.state} ${v.address.pincode}`} /><Row k="Selling" val={v.productClasses.map((c) => ({ GI: 'GI-tagged', HERITAGE: 'Heritage', TRADITION: 'Tradition' })[c]).join(', ')} /></Card>
      <Card title="Documents" step={1}>{DOCS.map((d) => { const doc = v.documents.find((x) => x.type === d.type)!; return <Row key={d.type} k={d.label} val={<span className="inline-flex items-center gap-1 text-success-700"><Check className="h-4 w-4" /> {doc.fileName}</span>} />; })}</Card>
      <Card title="GI certificates" step={2}>{v.giCertificates.length ? v.giCertificates.map((c) => <Row key={c.id} k={c.giTag} val={<span className="tabular">{c.certificateNumber}</span>} />) : <Row k="None" val="Not selling GI products" />}</Card>
      <Card title="Bank account" step={3}><Row k="Account" val={`${v.bank?.bankName} ${v.bank?.accountNumber}`} /><Row k="IFSC" val={<span className="tabular">{v.bank?.ifsc}</span>} /><Row k="Status" val={<span className="text-success-700">Verified by penny drop</span>} /></Card>
      <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} label={<span className="text-body-sm">I confirm the documents are genuine and I am authorised to sell these products. I understand that false GI claims lead to permanent removal.</span>} />
      <div className="flex gap-3"><Button type="button" variant="ghost" size="lg" onClick={onBack}>Back</Button><Button size="lg" className="flex-1" disabled={!agree} loading={mut.isPending} onClick={() => mut.mutate()}>Submit for verification</Button></div>
    </div>
  );
}
