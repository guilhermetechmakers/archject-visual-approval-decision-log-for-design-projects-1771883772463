import { useParams, Link } from 'react-router-dom'
import { Share2, Download, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DecisionDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-8" data-decision-id={id}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/dashboard/decisions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to decisions
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Kitchen finish options</h1>
          <p className="text-muted-foreground">Riverside Villa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share link
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual comparison</CardTitle>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Side-by-side view for client review
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">Option A</span>
                </div>
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">Option B</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4 text-center text-muted-foreground">
                No comments yet
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="warning" className="text-sm">Pending approval</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Awaiting client response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Share link sent — 2 days ago</p>
                <p>Client viewed — 1 day ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
