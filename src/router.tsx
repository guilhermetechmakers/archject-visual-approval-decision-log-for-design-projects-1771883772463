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
import { DecisionsListPage } from '@/pages/dashboard/decisions-list-page'
import { DecisionsPage } from '@/pages/dashboard/decisions'
import { DecisionDetailPage } from '@/pages/dashboard/decision-detail'
import { CreateDecisionPlaceholder } from '@/pages/dashboard/create-decision-placeholder'
import { CreateDecisionPage } from '@/pages/dashboard/create-decision-page'
import { EditDecisionPage } from '@/pages/dashboard/edit-decision-page'
import { DecisionDetailInternalPage } from '@/pages/dashboard/decision-detail-internal'
import { FilesLibraryPage } from '@/pages/dashboard/files-library-page'
import { TeamPage } from '@/pages/dashboard/team'
import { SettingsLayout } from '@/components/layout/settings-layout'
import { SettingsOverview } from '@/pages/dashboard/settings/settings-overview'
import { SettingsAccount } from '@/pages/dashboard/settings/settings-account'
import { SettingsBranding } from '@/pages/dashboard/settings/settings-branding'
import { SettingsNotifications } from '@/pages/dashboard/settings/settings-notifications'
import { SettingsIntegrations } from '@/pages/dashboard/settings/settings-integrations'
import { SettingsApiKeys } from '@/pages/dashboard/settings/settings-api-keys'
import { SettingsDataExport } from '@/pages/dashboard/settings/settings-data-export'
import { SettingsSessions } from '@/pages/dashboard/settings/settings-sessions'
import { SettingsSecurity } from '@/pages/dashboard/settings/settings-security'
import { SettingsTeam } from '@/pages/dashboard/settings/settings-team'
import { SettingsBilling } from '@/pages/dashboard/settings/settings-billing'
import { BillingPage } from '@/pages/dashboard/billing'
import { BillingHistoryPage } from '@/pages/dashboard/billing-history'
import { CheckoutPage } from '@/pages/dashboard/checkout'
import { OperationSuccessPage } from '@/pages/operation-success-page'
import { AnalyticsDashboardPage } from '@/pages/dashboard/analytics-dashboard-page'
import { AnalyticsDrilldownPage } from '@/pages/dashboard/analytics-drilldown-page'
import { ClientPortalPage } from '@/pages/client-portal'
import { PrivacyPage } from '@/pages/legal/privacy'
import { TermsPage } from '@/pages/legal/terms'
import { CookiesPage } from '@/pages/legal/cookies'
import { NotFoundPage } from '@/pages/errors/not-found'
import { ServerErrorPage } from '@/pages/errors/server-error'
import { AdminLayout } from '@/components/admin'
import { HelpPage } from '@/pages/dashboard/help-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AdminToolsPage } from '@/pages/admin/admin-tools-page'
import { AdminSettingsPage } from '@/pages/admin/admin-settings-page'

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
      { path: '/privacy-policy', element: <PrivacyPage /> },
      { path: '/legal/privacy', element: <PrivacyPage /> },
      { path: '/privacy-policy', element: <PrivacyPage /> },
      { path: '/legal/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/legal/terms', element: <TermsPage /> },
      { path: '/cookies', element: <CookiesPage /> },
      { path: '/legal/cookies', element: <CookiesPage /> },
      { path: '/cookie-policy', element: <CookiesPage /> },
      { path: '/portal/:token', element: <ClientPortalPage /> },
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'tools', element: <AdminToolsPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'analytics', element: <AnalyticsDashboardPage /> },
          { path: 'analytics/drilldown', element: <AnalyticsDrilldownPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <ProjectWorkspacePage /> },
          { path: 'projects/:projectId/decisions', element: <DecisionsListPage /> },
          { path: 'projects/:projectId/decisions/new', element: <CreateDecisionPage /> },
          { path: 'projects/:projectId/decisions/:decisionId/edit', element: <EditDecisionPage /> },
          { path: 'projects/:projectId/decisions/:decisionId/internal', element: <DecisionDetailInternalPage /> },
          { path: 'projects/:projectId/files', element: <FilesLibraryPage /> },
          { path: 'decisions', element: <DecisionsPage /> },
          { path: 'decisions/new', element: <CreateDecisionPlaceholder /> },
          { path: 'decisions/:id', element: <DecisionDetailPage /> },
          { path: 'team', element: <TeamPage /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <SettingsOverview /> },
              { path: 'account', element: <SettingsAccount /> },
              { path: 'branding', element: <SettingsBranding /> },
              { path: 'notifications', element: <SettingsNotifications /> },
              { path: 'integrations', element: <SettingsIntegrations /> },
              { path: 'api-keys', element: <SettingsApiKeys /> },
              { path: 'data-export', element: <SettingsDataExport /> },
              { path: 'sessions', element: <SettingsSessions /> },
              { path: 'security', element: <SettingsSecurity /> },
              { path: 'team', element: <SettingsTeam /> },
              { path: 'billing', element: <SettingsBilling /> },
            ],
          },
          { path: 'billing/history', element: <BillingHistoryPage /> },
          { path: 'billing', element: <BillingPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'success', element: <OperationSuccessPage /> },
          { path: 'help', element: <HelpPage /> },
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
      { path: '/about', element: <Navigate to="/dashboard/help" replace /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '/server-error', element: <ServerErrorPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
