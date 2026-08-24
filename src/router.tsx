import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { GuestOnly, RequireApproved, RequireAuth, RequireOnboarding } from '@/components/layout/Guards';
import { ToastRegion } from '@/components/ui';

const L = (f: () => Promise<{ default: React.ComponentType }>) => { const C = lazy(f); return <Suspense fallback={<div className="min-h-dvh bg-cream-100" />}><C /></Suspense>; };

export const router = createBrowserRouter([
  { element: <><Outlet /><ToastRegion /></>, children: [
    { element: <GuestOnly />, children: [
      { path: '/login', element: L(() => import('@/pages/auth/LoginPage')) },
      { path: '/register', element: L(() => import('@/pages/auth/RegisterPage')) },
      { path: '/forgot-password', element: L(() => import('@/pages/auth/ForgotPasswordPage')) },
    ] },
    { element: <RequireAuth />, children: [
      { path: '/verify-email', element: L(() => import('@/pages/auth/VerifyEmailPage')) },
      { element: <RequireOnboarding />, children: [
        { path: '/onboarding', element: L(() => import('@/pages/onboarding/OnboardingPage')) },
        { path: '/application-status', element: L(() => import('@/pages/onboarding/StatusPage')) },
      ] },
      { element: <RequireApproved />, children: [
        { element: <PanelLayout />, children: [
          { path: '/dashboard', element: L(() => import('@/pages/app/DashboardPage')) },
          { path: '/orders', element: L(() => import('@/pages/app/OrdersPage')) },
          { path: '/orders/:id', element: L(() => import('@/pages/app/OrderDetailPage')) },
          { path: '/returns', element: L(() => import('@/pages/app/ReturnsPage')) },
          { path: '/products', element: L(() => import('@/pages/app/ProductsPage')) },
          { path: '/products/new', element: L(() => import('@/pages/app/ProductFormPage')) },
          { path: '/products/:id', element: L(() => import('@/pages/app/ProductFormPage')) },
          { path: '/inventory', element: L(() => import('@/pages/app/InventoryPage')) },
          { path: '/coupons', element: L(() => import('@/pages/app/CouponsPage')) },
          { path: '/earnings', element: L(() => import('@/pages/app/EarningsPage')) },
          { path: '/reviews', element: L(() => import('@/pages/app/ReviewsPage')) },
          { path: '/certificates', element: L(() => import('@/pages/app/CertificatesPage')) },
          { path: '/settings', element: L(() => import('@/pages/app/SettingsPage')) },
          { path: '/help', element: L(() => import('@/pages/app/HelpPage')) },
        ] },
      ] },
    ] },
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ] },
]);
