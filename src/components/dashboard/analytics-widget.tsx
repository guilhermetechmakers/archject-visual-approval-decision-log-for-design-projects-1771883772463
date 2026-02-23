import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const mockChartData = [
  { name: 'Mon', approvals: 4 },
  { name: 'Tue', approvals: 3 },
  { name: 'Wed', approvals: 6 },
  { name: 'Thu', approvals: 5 },
  { name: 'Fri', approvals: 8 },
  { name: 'Sat', approvals: 2 },
  { name: 'Sun', approvals: 1 },
]

export interface AnalyticsWidgetProps {
  className?: string
}

export function AnalyticsWidget({ className }: AnalyticsWidgetProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Approvals over time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Weekly approval trend
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="approvalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(25, 92, 74)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(25, 92, 74)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="approvals"
                stroke="rgb(25, 92, 74)"
                fill="url(#approvalGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
