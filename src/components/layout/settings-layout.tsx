import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsNav } from '@/components/settings/settings-nav'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function SettingsLayout() {
  const [navCollapsed, setNavCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-card p-4 md:flex',
          navCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          {!navCollapsed && (
            <h2 className="text-sm font-semibold text-foreground">Settings</h2>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNavCollapsed((c) => !c)}
            aria-label={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {navCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SettingsNav collapsed={navCollapsed} />
      </aside>

      <div className="min-w-0 flex-1 animate-fade-in">
        {/* Mobile: menu button above content */}
        <div className="mb-4 flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Settings menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <SettingsNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
