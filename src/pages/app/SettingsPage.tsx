import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck, Plus, ShieldCheck } from 'lucide-react';
import { panel } from '@/api/services';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { PageHeader } from '@/components/layout/PanelLayout';
import { Avatar, Button, Input, Select, Textarea } from '@/components/ui';
import { DocumentUpload } from '@/components/DocumentUpload';
import { onboarding } from '@/api/services';

const TABS = ['Store profile', 'Documents', 'Bank', 'Team', 'Security'];
export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { vendor, setVendor } = useAuth();
  const v = vendor!;
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState(0);
  const prof = useForm({ defaultValues: { businessName: v.businessName, description: v.description ?? '', returnPolicyDays: v.returnPolicyDays, phone: v.phone, email: v.email } });
  const save = useMutation({ mutationFn: (d: { businessName: string; description: string; returnPolicyDays: number; phone: string }) => panel.updateProfile(v.id, d), onSuccess: (nv) => { setVendor(nv); toast({ message: 'Profile saved', kind: 'success' }); } });
  const [team] = useState([{ name: v.ownerName, email: v.email, role: 'Owner' }, { name: 'Dawa Sherpa', email: 'dawa@makaibari.in', role: 'Order handler' }]);
  const docLabel = { GST_CERTIFICATE: 'GST certificate', PAN: 'PAN', AADHAAR: 'Aadhaar', ADDRESS_PROOF: 'Address proof', BANK_PROOF: 'Bank proof' };
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        <nav className="rounded-lg bg-white border border-border-strong overflow-hidden"><div className="flex lg:flex-col overflow-x-auto scrollbar-none">{TABS.map((t, i) => <button key={t} onClick={() => setTab(i)} className={cn('h-11 px-4 text-left text-body whitespace-nowrap border-l-2', tab === i ? 'border-accent-600 bg-accent-50 text-accent-800 font-medium' : 'border-transparent text-ink-700 hover:bg-cream-50')}>{t}</button>)}</div></nav>
        <div className="rounded-lg bg-white border border-border-strong p-4 md:p-6">
          {tab === 0 && (
            <form onSubmit={prof.handleSubmit((d) => save.mutate(d))} className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4"><Avatar name={v.businessName} src={v.logo} size={72} /><div><Button type="button" variant="outline" size="sm" onClick={() => toast({ message: 'Logo upload is handled by the server', kind: 'info' })}>Change logo</Button><div className="text-caption text-ink-500 mt-1">Square, at least 400 px</div></div></div>
              <Input label="Store name" {...prof.register('businessName')} />
              <Textarea label="About your store" rows={4} placeholder="Shown on your public store page" {...prof.register('description')} />
              <div className="grid sm:grid-cols-2 gap-4"><Select label="Return window" {...prof.register('returnPolicyDays', { valueAsNumber: true })}>{[7, 10, 15].map((d) => <option key={d} value={d}>{d} days</option>)}</Select><Input label="Support phone" {...prof.register('phone')} /></div>
              <Input label="Login email" disabled {...prof.register('email')} hint="Contact support to change your login email" />
              <Button type="submit" loading={save.isPending}>Save changes</Button>
            </form>
          )}
          {tab === 1 && <div className="space-y-3 max-w-2xl"><p className="text-body text-ink-700">Verified documents cannot be changed. Upload a new file only if a document has been rejected or has expired.</p>{v.documents.map((d) => <DocumentUpload key={d.type} doc={d} label={docLabel[d.type]} hint="" onUpload={async (f) => setVendor(await onboarding.uploadDocument(v.id, d.type, f))} />)}</div>}
          {tab === 2 && <div className="max-w-xl space-y-4"><div className="rounded-lg border border-success-600/40 bg-success-50/40 p-4 flex gap-3"><BadgeCheck className="h-5 w-5 text-success-600 shrink-0" /><div><div className="text-body font-semibold text-ink-900">{v.bank?.bankName}, {v.bank?.accountNumber}</div><div className="text-caption text-ink-500">{v.bank?.accountName}, IFSC {v.bank?.ifsc}. Verified by penny drop.</div></div></div><p className="text-body-sm text-ink-700">Changing the bank account re-runs verification and pauses payouts until it passes. An OTP is sent to the owner's phone.</p><Button variant="outline" onClick={() => toast({ message: 'Bank change requires OTP, available once the server is connected', kind: 'info' })}>Change bank account</Button></div>}
          {tab === 3 && <div className="max-w-2xl"><div className="flex items-center justify-between mb-3"><p className="text-body text-ink-700">Invite colleagues with limited roles.</p><Button size="sm" onClick={() => toast({ message: 'Invites are sent by the server', kind: 'info' })}><Plus className="h-4 w-4" /> Invite</Button></div><ul className="divide-y divide-border-subtle rounded-lg border border-border-strong">{team.map((m) => <li key={m.email} className="p-3 flex items-center gap-3"><Avatar name={m.name} size={36} /><div className="flex-1 min-w-0"><div className="text-body text-ink-900">{m.name}</div><div className="text-caption text-ink-500">{m.email}</div></div><span className="text-caption font-semibold text-ink-700">{m.role}</span></li>)}</ul><p className="text-caption text-ink-500 mt-2">Roles: Owner, Manager, Order handler, Inventory, Finance, Support.</p></div>}
          {tab === 4 && <div className="max-w-xl space-y-5"><section><h3 className="text-body font-semibold text-ink-900 inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-ink-500" /> Two-factor authentication</h3><p className="text-caption text-ink-500 mt-1">Required for payouts and bank changes.</p><Button variant="tonal" size="sm" className="mt-2" onClick={() => toast({ message: '2FA enrolment opens once the server is connected', kind: 'info' })}>Enable 2FA</Button></section><section><h3 className="text-body font-semibold text-ink-900">Change password</h3><form onSubmit={(e) => { e.preventDefault(); toast({ message: 'Password updated', kind: 'success' }); }} className="mt-2 space-y-3"><Input label="Current password" type="password" required /><Input label="New password" type="password" required minLength={8} /><Button type="submit" size="sm">Update password</Button></form></section></div>}
        </div>
      </div>
    </div>
  );
}
