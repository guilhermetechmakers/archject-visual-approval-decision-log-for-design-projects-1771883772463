import { Check, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGettingStarted } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function GettingStartedSection() {
  const { data, isLoading, updateStep, isUpdating } = useGettingStarted()

  if (isLoading || !data) {
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const { steps } = data
  const completed = steps.filter((s) => s.completed).length
  const progress = steps.length > 0 ? (completed / steps.length) * 100 : 0

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-xl">Getting Started</CardTitle>
        <CardDescription>
          Complete these steps to get the most out of Archject
        </CardDescription>
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completed} of {steps.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            type="button"
            onClick={() => !isUpdating && updateStep(step.id, !step.completed)}
            disabled={isUpdating}
            aria-label={`${step.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${step.label}`}
            aria-pressed={step.completed}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border border-border p-4 text-left transition-all duration-200',
              'hover:border-primary/30 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              step.completed && 'border-success/30 bg-success/5'
            )}
          >
            {step.completed ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20">
                <Check className="h-4 w-4 text-success" aria-hidden />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted">
                <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
            )}
            <span
              className={cn(
                'flex-1 font-medium',
                step.completed && 'text-muted-foreground line-through'
              )}
            >
              {idx + 1}. {step.label}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
