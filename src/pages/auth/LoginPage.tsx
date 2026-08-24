import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { auth } from '@/api/services';
import { useAuth } from '@/store/auth';
import { useDocumentTitle } from '@/hooks';
import { homeFor } from '@/components/layout/Guards';
import { Button, InlineBanner, Input } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
import type { ApiError } from '@/types';

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(6, 'Minimum 6 characters') });
export default function LoginPage() {
  useDocumentTitle('Log in');
  const navigate = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const mut = useMutation({ mutationFn: (d: z.infer<typeof schema>) => auth.login(d.email, d.password), onSuccess: ({ vendor, token }) => { setSession(vendor, token); navigate(homeFor(vendor), { replace: true }); } });
  const err = mut.error as ApiError | null;
  return (
    <AuthShell title="Seller log in" subtitle="Manage your store on Tag Traditions" footer={<>New seller? <Link to="/register" className="text-accent-600 font-medium hover:underline">Create a seller account</Link></>}>
      {err && <InlineBanner tone="error" className="mb-4">{err.message}</InlineBanner>}
      <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
        <Input label="Email" type="email" size="lg" autoComplete="email" placeholder="you@business.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type={show ? 'text' : 'password'} size="lg" autoComplete="current-password" placeholder="Your password" trailing={<button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password" className="text-ink-500">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} {...register('password')} error={errors.password?.message} />
        <div className="flex justify-end -mt-1"><Link to="/forgot-password" className="text-body-sm text-accent-600 hover:underline">Forgot password?</Link></div>
        <Button type="submit" size="lg" full loading={mut.isPending}>Log in</Button>
        <p className="text-caption text-ink-400 text-center pt-1">Demo seller: tenzing@makaibari.in with any password of 6+ characters</p>
      </form>
    </AuthShell>
  );
}
