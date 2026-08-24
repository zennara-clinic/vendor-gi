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
import { Button, Checkbox, InlineBanner, Input } from '@/components/ui';
import { AuthShell } from '@/components/layout/AuthShell';
import type { ApiError } from '@/types';

const schema = z.object({
  ownerName: z.string().min(2, 'Enter your name'), email: z.string().email('Enter a valid email'), phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(8, 'At least 8 characters').regex(/[0-9]/, 'Include a number').regex(/[A-Z]/, 'Include a capital letter'),
  agree: z.literal(true, { message: 'Please accept the seller agreement' }),
});
type F = z.infer<typeof schema>;
export default function RegisterPage() {
  useDocumentTitle('Create seller account');
  const navigate = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [show, setShow] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });
  const pw = watch('password') ?? '';
  const strength = [pw.length >= 8, /[0-9]/.test(pw), /[A-Z]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const mut = useMutation({ mutationFn: (d: F) => auth.register({ ownerName: d.ownerName, email: d.email, phone: d.phone, password: d.password }), onSuccess: ({ vendor, token }) => { setSession(vendor, token); navigate('/verify-email', { replace: true }); } });
  const err = mut.error as ApiError | null;
  return (
    <AuthShell title="Create a seller account" subtitle="Step 1 of 5. Verification takes about ten minutes." footer={<>Already a seller? <Link to="/login" className="text-accent-600 font-medium hover:underline">Log in</Link></>}>
      {err && <InlineBanner tone="error" className="mb-4">{err.message}</InlineBanner>}
      <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
        <Input label="Your full name" size="lg" autoComplete="name" placeholder="As on your PAN" {...register('ownerName')} error={errors.ownerName?.message} />
        <Input label="Business email" type="email" size="lg" autoComplete="email" placeholder="you@business.com" {...register('email')} error={errors.email?.message} />
        <Input label="Mobile number" size="lg" inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit number" leading={<span className="text-body font-medium text-ink-700">+91</span>} {...register('phone')} error={errors.phone?.message} />
        <div>
          <Input label="Password" type={show ? 'text' : 'password'} size="lg" autoComplete="new-password" placeholder="8+ characters, a number and a capital" trailing={<button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password" className="text-ink-500">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} {...register('password')} error={errors.password?.message} />
          {pw && <div className="mt-2 flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength <= 1 ? 'bg-error-600' : strength <= 2 ? 'bg-warning-400' : 'bg-success-600') : 'bg-cream-300'}`} />)}</div>}
        </div>
        <Checkbox {...register('agree')} label={<span className="text-body-sm">I agree to the <a href={`${import.meta.env.VITE_STORE_URL ?? ''}/policy/seller-agreement`} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline">Seller Agreement</a> and <a href={`${import.meta.env.VITE_STORE_URL ?? ''}/policy/privacy`} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline">Privacy Policy</a>.</span>} />
        {errors.agree && <p className="text-caption text-error-700 -mt-2">{errors.agree.message}</p>}
        <Button type="submit" size="lg" full loading={mut.isPending}>Continue</Button>
      </form>
    </AuthShell>
  );
}
