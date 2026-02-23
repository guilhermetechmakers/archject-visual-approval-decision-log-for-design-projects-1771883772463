import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/root-layout'
import { LandingPage } from '@/pages/landing'
import { DemoRequestPage } from '@/pages/demo-request'
import { AuthLoginPage } from '@/pages/auth/auth-login-page'
import { PasswordResetPage } from '@/pages/auth/password-reset-page'
import { ResetPasswordRoute } from '@/pages/auth/reset-password-route'
import { PasswordResetConfirmPage } from '@/pages/auth/password-reset-confirm-page'
import { EmailVerificationPage } from '@/pages/auth/email-verification-page'
import { PasswordResetGuard, ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardOverview } from '@/pages/dashboard/overview'
import { ProjectsPage } from '@/pages/dashboard/projects'
import { ProjectWorkspacePage } from '@/pages/dashboard/project-workspace'
import { DecisionsPage } from '@/pages/dashboard/decisions'
import { DecisionDetailPage } from '@/pages/dashboard/decision-detail'
import { CreateDecisionPlaceholder } from '@/pages/dashboard/create-decision-placeholder'
import { CreateDecisionPage } from '@/pages/dashboard/create-decision-page'
import { EditDecisionPage } from '@/pages/dashboard/edit-decision-page'
import { DecisionDetailInternalPage } from '@/pages/dashboard/decision-detail-internal'
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
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/auth/login', element: <AuthLoginPage /> },
      { path: '/auth/signup', element: <AuthLoginPage /> },
      {
        path: '/auth/password-reset',
        element: (
          <PasswordResetGuard>
            <PasswordResetPage />
          </PasswordResetGuard>
        ),
      },
      {
        path: '/auth/password-reset/confirm',
        element: (
          <PasswordResetGuard>
            <PasswordResetConfirmPage />
          </PasswordResetGuard>
        ),
      },
      {
        path: '/auth/reset-password/:token',
        element: (
          <PasswordResetGuard>
            <ResetPasswordRoute />
          </PasswordResetGuard>
        ),
      },
      { path: '/verify', element: <EmailVerificationPage /> },
      { path: '/demo-request', element: <DemoRequestPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/cookies', element: <CookiesPage /> },
      { path: '/portal/:token', element: <ClientPortalPage /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <ProjectWorkspacePage /> },
          { path: 'projects/:projectId/decisions/new', element: <CreateDecisionPage /> },
          { path: 'projects/:projectId/decisions/:decisionId/edit', element: <EditDecisionPage /> },
          { path: 'projects/:projectId/decisions/:decisionId/internal', element: <DecisionDetailInternalPage /> },
          { path: 'decisions', element: <DecisionsPage /> },
          { path: 'decisions/new', element: <CreateDecisionPlaceholder /> },
          { path: 'decisions/:id', element: <DecisionDetailPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'billing', element: <BillingPage /> },
        ],
      },
      { path: '/login', element: <Navigate to="/auth/login" replace /> },
      { path: '/signup', element: <Navigate to="/auth/signup" replace /> },
      {
        path: '/forgot-password',
        element: <Navigate to="/auth/password-reset" replace />,
      },
      { path: '/features', element: <Navigate to="/#features" replace /> },
      { path: '/pricing', element: <Navigate to="/#pricing" replace /> },
      { path: '/about', element: <Navigate to="/#features" replace /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
