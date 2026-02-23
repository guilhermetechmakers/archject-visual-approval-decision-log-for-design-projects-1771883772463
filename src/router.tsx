import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { DemoRequestPage } from '@/pages/demo-request'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardOverview } from '@/pages/dashboard/overview'
import { ProjectsPage } from '@/pages/dashboard/projects'
import { DecisionsPage } from '@/pages/dashboard/decisions'
import { DecisionDetailPage } from '@/pages/dashboard/decision-detail'
import { CreateDecisionPlaceholder } from '@/pages/dashboard/create-decision-placeholder'
import { TeamPage } from '@/pages/dashboard/team'
import { SettingsPage } from '@/pages/dashboard/settings'
import { BillingPage } from '@/pages/dashboard/billing'
import { ClientPortalPage } from '@/pages/client-portal'
import { PrivacyPage } from '@/pages/legal/privacy'
import { TermsPage } from '@/pages/legal/terms'
import { CookiesPage } from '@/pages/legal/cookies'
import { NotFoundPage } from '@/pages/errors/not-found'
import { ServerErrorPage } from '@/pages/errors/server-error'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/demo-request', element: <DemoRequestPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/cookies', element: <CookiesPage /> },
  { path: '/portal/:token', element: <ClientPortalPage /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'decisions', element: <DecisionsPage /> },
      { path: 'decisions/new', element: <CreateDecisionPlaceholder /> },
      { path: 'decisions/:id', element: <DecisionDetailPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'billing', element: <BillingPage /> },
    ],
  },
  { path: '/features', element: <Navigate to="/#features" replace /> },
  { path: '/pricing', element: <Navigate to="/#pricing" replace /> },
  { path: '/about', element: <Navigate to="/#features" replace /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
