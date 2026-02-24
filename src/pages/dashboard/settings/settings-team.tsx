import { Link } from 'react-router-dom'
import { Users, ArrowRight, UserPlus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettingsTeam } from '@/hooks/use-settings'

function TeamMembersEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center animate-fade-in"
      role="status"
      aria-label="No team members"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-foreground">
        No team members yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Invite members to your workspace to collaborate on decisions, share feedback, and manage
        approvals together.
      </p>
      <Button
        asChild
        className="mt-6 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
        aria-label="Invite team members"
      >
        <Link to="/dashboard/team" className="inline-flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite team members
        </Link>
      </Button>
    </div>
  )
}

function TeamMembersErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
      aria-label="Failed to load team members"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-foreground">
        Failed to load team members
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong while loading your workspace members. Please try again.
      </p>
      <Button
        variant="outline"
        size="lg"
        className="mt-6 rounded-full transition-all duration-200 hover:scale-[1.02]"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  )
}

function TeamMembersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border p-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="mt-1 h-5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SettingsTeam() {
  const { data: team, isLoading, isError, refetch } = useSettingsTeam()
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
          {isError ? (
            <TeamMembersErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <TeamMembersSkeleton />
          ) : members.length === 0 ? (
            <TeamMembersEmptyState />
          ) : (
            <>
              <div className="space-y-4">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-card"
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
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link
                  to="/dashboard/team"
                  className="inline-flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                >
                  Open Team page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
