import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Box, Zap, Settings } from 'lucide-react'
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
  const navigate = useNavigate()

  const handleConfigure = (integrationId: string) => {
    if (onConfigure) {
      onConfigure(integrationId)
    } else {
      navigate('/dashboard/settings/integrations')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/dashboard/settings/integrations"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {integrations.map((int) => {
          const Icon = int.icon
          return (
            <Card
              key={int.id}
              className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover"
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
                  className="mt-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleConfigure(int.id)}
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
