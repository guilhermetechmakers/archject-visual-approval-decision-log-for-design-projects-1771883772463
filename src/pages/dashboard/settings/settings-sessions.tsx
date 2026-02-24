import { Monitor } from 'lucide-react'
import { SessionsCard } from '@/components/settings'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SettingsSessions() {
  return (
    <main
      className={cn(
        'space-y-6 sm:space-y-8',
        'min-h-0 w-full max-w-4xl',
        'animate-fade-in'
      )}
      role="main"
      aria-label="Session settings"
    >
      <Card
        className={cn(
          'rounded-xl border border-border bg-card shadow-card',
          'transition-all duration-200 hover:shadow-card-hover'
        )}
      >
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-2">
            <Monitor
              className="h-5 w-5 shrink-0 text-primary"
              aria-hidden
            />
            <CardTitle
              className={cn(
                'text-xl font-semibold tracking-tight text-foreground',
                'sm:text-2xl'
              )}
            >
              Sessions
            </CardTitle>
          </div>
          <CardDescription
            className={cn(
              'mt-1 text-sm text-muted-foreground',
              'sm:text-base'
            )}
          >
            Active devices and session management
          </CardDescription>
        </CardHeader>
      </Card>

      <section
        className="space-y-4 sm:space-y-6"
        aria-label="Session management"
      >
        <SessionsCard />
      </section>
    </main>
  )
}
