/**
 * Admin Dashboard layout - shell with top nav, left nav, profile.
 */

import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AdminNav } from './admin-nav'
import { AdminSideNav } from './admin-side-nav'
import { AdminHeader } from './admin-header'
import { ImpersonationBanner } from './impersonation-banner'
import { Button } from '@/components/ui/button'
import { ImpersonationProvider } from '@/contexts/impersonation-context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function AdminLayout() {
  const [sideNavCollapsed, setSideNavCollapsed] = React.useState(false)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <ImpersonationProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <ImpersonationBanner />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop: left sidebar */}
          <AdminSideNav
            collapsed={sideNavCollapsed}
            onToggle={() => setSideNavCollapsed((c) => !c)}
            className="hidden md:flex"
          />
          {/* Mobile: sheet overlay */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle>Admin</SheetTitle>
          </SheetHeader>
          <AdminSideNav
            collapsed={false}
            onToggle={() => setMobileNavOpen(false)}
            onNavigate={() => setMobileNavOpen(false)}
            className="!w-full border-0"
          />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <div className="flex flex-col gap-4 border-b border-border bg-card px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <AdminNav />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
        </div>
      </div>
    </ImpersonationProvider>
  )
}
