import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettingsTeam } from '@/hooks/use-settings'

export function SettingsTeam() {
  const { data: team } = useSettingsTeam()
  const members = team ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team & users</h1>
        <p className="mt-1 text-muted-foreground">
          Invite members and manage roles
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workspace members
          </CardTitle>
          <CardDescription>
            Manage who has access to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.email}</p>
                <span className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                  {m.role}
                </span>
              </div>
            </div>
          ))}
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/team" className="inline-flex items-center gap-2">
              Open Team page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
