import { Link } from 'react-router-dom'
import {
  FolderKanban,
  FileCheck,
  Clock,
  TrendingUp,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const mockApprovals = [
  { id: '1', title: 'Kitchen finish options', project: 'Riverside Villa', due: '2 days' },
  { id: '2', title: 'Bathroom tile selection', project: 'Riverside Villa', due: '5 days' },
  { id: '3', title: 'Exterior color palette', project: 'Urban Loft', due: '1 week' },
]

const mockActivity = [
  { id: '1', text: 'Client approved Kitchen finish options', time: '2 hours ago' },
  { id: '2', text: 'New decision created: Bathroom tile selection', time: '5 hours ago' },
  { id: '3', text: 'Share link sent for Exterior color palette', time: '1 day ago' },
]

const mockChartData = [
  { name: 'Mon', approvals: 4 },
  { name: 'Tue', approvals: 3 },
  { name: 'Wed', approvals: 6 },
  { name: 'Thu', approvals: 5 },
  { name: 'Fri', approvals: 8 },
  { name: 'Sat', approvals: 2 },
  { name: 'Sun', approvals: 1 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/dashboard/decisions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New decision
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting approval
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Decisions pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved this week
            </CardTitle>
            <FileCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+3</span> vs last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. approval time
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 days</div>
            <p className="text-xs text-muted-foreground">Down from 4.1 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Awaiting approvals</CardTitle>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Decisions waiting for client response
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockApprovals.map((item) => (
                <Link
                  key={item.id}
                  to={`/dashboard/decisions/${item.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.project}</p>
                  </div>
                  <Badge variant="warning">{item.due}</Badge>
                </Link>
              ))}
            </div>
            <Link to="/dashboard/decisions" className="mt-4 block">
              <Button variant="ghost" className="w-full">
                View all decisions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Latest updates across your workspace
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg p-3"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approvals over time</CardTitle>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Weekly approval trend
          </CardContent>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="approvals"
                  stroke="rgb(25, 92, 74)"
                  fill="rgb(25, 92, 74)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
