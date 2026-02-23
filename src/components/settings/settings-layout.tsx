import { Outlet } from 'react-router-dom'
import { SettingsNav } from './settings-nav'
import { cn } from '@/lib/utils'

export function SettingsLayout() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="sticky top-0">
            <SettingsNav />
          </div>
        </aside>
        <main className={cn('min-w-0 flex-1')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
