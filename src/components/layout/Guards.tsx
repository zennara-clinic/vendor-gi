import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';

/** Where a vendor should be, given their state. */
export function homeFor(v: { status: string; onboardingStep: number; emailVerified: boolean } | null) {
  if (!v) return '/login';
  if (!v.emailVerified) return '/verify-email';
  if (v.status === 'APPROVED') return '/dashboard';
  if (v.status === 'DRAFT') return '/onboarding';
  return '/application-status';
}

export function RequireAuth() {
  const vendor = useAuth((s) => s.vendor);
  const loc = useLocation();
  if (!vendor) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
export function RequireOnboarding() {
  const vendor = useAuth((s) => s.vendor)!;
  if (!vendor.emailVerified) return <Navigate to="/verify-email" replace />;
  if (vendor.status === 'APPROVED') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
export function RequireApproved() {
  const vendor = useAuth((s) => s.vendor)!;
  if (vendor.status !== 'APPROVED') return <Navigate to={homeFor(vendor)} replace />;
  return <Outlet />;
}
export function GuestOnly() {
  const vendor = useAuth((s) => s.vendor);
  if (vendor) return <Navigate to={homeFor(vendor)} replace />;
  return <Outlet />;
}
