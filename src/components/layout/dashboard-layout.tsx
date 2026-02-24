import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { DashboardTopbar } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { BrandingProvider } from '@/contexts/branding-context'
import { useSettingsWorkspace } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null)
  const { data: workspace } = useSettingsWorkspace()

  return (
    <BrandingProvider workspaceBranding={workspace?.branding}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          className={cn(
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden md:flex'
          )}
        />
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <DashboardTopbar
              workspaceId={workspaceId}
              onWorkspaceChange={setWorkspaceId}
              className="flex-1 min-w-0 border-0"
            />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet context={{ workspaceId }} />
          </main>
        </div>
      </div>
    </BrandingProvider>
  )
}
