/**
 * NotificationPreview - Inline preview of notification channel configuration.
 * Shows which channels are active for each category.
 */

import { Bell, Mail, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationSettings } from '@/types/settings'

interface NotificationPreviewProps {
  settings: NotificationSettings | null | undefined
  className?: string
}

const CHANNEL_CONFIG = {
  inApp: { icon: Bell, label: 'In-app', color: 'text-primary' },
  email: { icon: Mail, label: 'Email', color: 'text-muted-foreground' },
  sms: { icon: Smartphone, label: 'SMS', color: 'text-muted-foreground' },
} as const

export function NotificationPreview({ settings, className }: NotificationPreviewProps) {
  const channels = settings?.channels ?? {
    approvals: { inApp: true, email: true, sms: false },
    comments: { inApp: true, email: true, sms: false },
    reminders: { inApp: true, email: true, sms: false },
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-secondary/30 p-4',
        className
      )}
    >
      <p className="mb-3 text-sm font-medium text-foreground">Preview</p>
      <div className="space-y-3">
        {(['approvals', 'comments', 'reminders'] as const).map((category) => (
          <div key={category} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium capitalize text-muted-foreground">
              {category}:
            </span>
            {(Object.keys(CHANNEL_CONFIG) as (keyof typeof CHANNEL_CONFIG)[]).map((ch) => {
              const config = CHANNEL_CONFIG[ch]
              const Icon = config.icon
              const isActive = channels[category]?.[ch]
              return (
                <span
                  key={ch}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                  {isActive && (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      {settings?.reminderSchedule && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Reminders: {settings.reminderSchedule.defaultTime ?? '09:00'} •{' '}
          {settings.reminderSchedule.cadence ?? 'daily'}
        </p>
      )}
    </div>
  )
}
