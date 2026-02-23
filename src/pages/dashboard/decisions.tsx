import { Link } from 'react-router-dom'
import { Plus, FileCheck, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
        <h1 className="text-2xl font-bold">Decisions</h1>
        <Link to="/dashboard/decisions/new">
          <Button>
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
          <DecisionsList decisions={mockDecisions} />
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <DecisionsList decisions={mockDecisions.filter((d) => d.status === 'pending')} />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <DecisionsList decisions={mockDecisions.filter((d) => d.status === 'approved')} />
        </TabsContent>
        <TabsContent value="draft" className="mt-6">
          <DecisionsList decisions={mockDecisions.filter((d) => d.status === 'draft')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DecisionsList({
  decisions,
}: {
  decisions: { id: string; title: string; status: string; project: string }[]
}) {
  if (decisions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileCheck className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No decisions found</p>
          <p className="text-sm text-muted-foreground">
            Create your first decision to get started
          </p>
          <Link to="/dashboard/decisions/new" className="mt-4">
            <Button>New decision</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {decisions.map((decision) => (
        <Link
          key={decision.id}
          to={`/dashboard/decisions/${decision.id}`}
          className="block"
        >
          <Card className="transition-all hover:shadow-card-hover">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{decision.title}</p>
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
