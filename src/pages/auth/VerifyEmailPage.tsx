import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { auth } from '@/api/services';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { useDocumentTitle } from '@/hooks';
import { Button, InlineBanner, Input } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
import type { ApiError } from '@/types';
export default function VerifyEmailPage() {
  useDocumentTitle('Verify your contact details');
  const { vendor, setVendor, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useUI((s) => s.toast);
  const [otp, setOtp] = useState('');
  const mut = useMutation({ mutationFn: () => auth.verifyEmailOtp(vendor!.email, otp), onSuccess: (v) => { setVendor(v); navigate('/onboarding', { replace: true }); } });
  if (vendor?.emailVerified) { navigate('/onboarding', { replace: true }); return null; }
  const err = mut.error as ApiError | null;
  return (
    <AuthShell title="Verify your contact details" subtitle={`We sent a 6-digit code to ${vendor?.email} and +91 ${vendor?.phone}`} footer={<button onClick={() => { logout(); navigate('/register'); }} className="text-accent-600 font-medium hover:underline">Use a different email</button>}>
      {err && <InlineBanner tone="error" className="mb-4">{err.message}</InlineBanner>}
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-4">
        <Input label="Verification code" size="lg" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="[&_input]:tracking-[0.5em] [&_input]:text-center [&_input]:text-h3" hint="Valid for 10 minutes. Demo: any 6 digits." autoFocus />
        <Button type="submit" size="lg" full loading={mut.isPending} disabled={otp.length !== 6}>Verify and continue</Button>
        <button type="button" onClick={() => toast({ message: 'A new code has been sent', kind: 'success' })} className="w-full text-body-sm text-accent-600 hover:underline">Resend code</button>
      </form>
    </AuthShell>
  );
}
