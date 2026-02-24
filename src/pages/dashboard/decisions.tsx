import { Link } from 'react-router-dom'
import { Plus, FileCheck, Search, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const mockDecisions = [
  { id: '1', title: 'Kitchen finish options', status: 'pending', project: 'Riverside Villa' },
  { id: '2', title: 'Bathroom tile selection', status: 'approved', project: 'Riverside Villa' },
  { id: '3', title: 'Exterior color palette', status: 'draft', project: 'Urban Loft' },
]

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  pending: 'warning',
  approved: 'success',
  draft: 'secondary',
}

export function DecisionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Decisions</h1>
        <Link to="/dashboard/decisions/new">
          <Button variant="default" className="rounded-pill">
            <Plus className="mr-2 h-4 w-4" />
            New decision
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <DecisionsList decisions={mockDecisions} isLoading={false} error={null} />
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <DecisionsList
            decisions={mockDecisions.filter((d) => d.status === 'pending')}
            isLoading={false}
            error={null}
          />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <DecisionsList
            decisions={mockDecisions.filter((d) => d.status === 'approved')}
            isLoading={false}
            error={null}
          />
        </TabsContent>
        <TabsContent value="draft" className="mt-6">
          <DecisionsList
            decisions={mockDecisions.filter((d) => d.status === 'draft')}
            isLoading={false}
            error={null}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DecisionsEmptyState() {
  return (
    <Card
      className="border border-border border-dashed bg-card shadow-card"
      role="status"
      aria-label="No decisions"
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileCheck className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">
          No decisions found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create your first decision to get started, or invite your team to collaborate.
        </p>
        <div className="mt-6">
          <Button
            asChild
            variant="default"
            size="lg"
            className="rounded-pill"
            aria-label="Create your first decision"
          >
            <Link to="/dashboard/decisions/new">
              <Plus className="mr-2 h-4 w-4" />
              Create decision
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DecisionsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card
      className="border border-destructive/30 bg-destructive/5"
      role="alert"
      aria-label="Failed to load decisions"
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">
          Failed to load decisions
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your decisions. Please try again.
        </p>
        <Button variant="outline" size="lg" className="mt-6 rounded-pill" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

function DecisionsListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DecisionsList({
  decisions,
  isLoading = false,
  error = null,
}: {
  decisions: { id: string; title: string; status: string; project: string }[]
  isLoading?: boolean
  error?: string | null
}) {
  if (error) {
    return <DecisionsErrorState onRetry={() => window.location.reload()} />
  }

  if (isLoading) {
    return <DecisionsListSkeleton />
  }

  if (decisions.length === 0) {
    return <DecisionsEmptyState />
  }

  return (
    <div className="space-y-2">
      {decisions.map((decision) => (
        <Link
          key={decision.id}
          to={`/dashboard/decisions/${decision.id}`}
          className="block"
        >
          <Card className="transition-all duration-200 hover:shadow-card-hover">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{decision.title}</p>
                  <p className="text-sm text-muted-foreground">{decision.project}</p>
                </div>
              </div>
              <Badge variant={statusVariants[decision.status] ?? 'default'}>
                {decision.status}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
