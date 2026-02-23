import { Calendar, Box, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface IntegrationsHubProps {
  projectId?: string
  onConfigure?: (integration: string) => void
  className?: string
}

const integrations = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Create calendar events from decision deadlines',
    icon: Calendar,
  },
  {
    id: 'autodesk-forge',
    name: 'Autodesk Forge',
    description: 'BIM/CAD viewer links for drawings',
    icon: Box,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via webhooks',
    icon: Zap,
  },
]

export function IntegrationsHub({
  projectId: _projectId,
  onConfigure,
  className,
}: IntegrationsHubProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold">Integrations</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {integrations.map((int) => {
          const Icon = int.icon
          return (
            <Card
              key={int.id}
              className="transition-all hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{int.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {int.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => onConfigure?.(int.id)}
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
