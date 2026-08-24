import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { auth } from '@/api/services';
import { useDocumentTitle } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password');
  const [email, setEmail] = useState('');
  const mut = useMutation({ mutationFn: () => auth.forgot(email) });
  return (
    <AuthShell title="Reset your password" subtitle="We will email you a link to set a new one" footer={<Link to="/login" className="text-accent-600 font-medium hover:underline">Back to log in</Link>}>
      {mut.isSuccess ? <div className="text-center py-2"><MailCheck className="h-10 w-10 text-success-600 mx-auto" /><p className="text-body text-ink-700 mt-3">If a seller account exists for <b>{email}</b>, a reset link is on its way.</p></div> : (
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-4"><Input label="Email" type="email" size="lg" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" /><Button type="submit" size="lg" full loading={mut.isPending}>Send reset link</Button></form>
      )}
    </AuthShell>
  );
}
