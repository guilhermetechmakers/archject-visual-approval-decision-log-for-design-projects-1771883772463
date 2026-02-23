import { Check, Circle, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useOnboardingGuides } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Guide } from '@/types/help'

export function OnboardingGuidesSection() {
  const { data: guides, isLoading, updateStep, isUpdating } = useOnboardingGuides()

  if (isLoading || !guides) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="rounded-xl">
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {guides.map((guide: Guide) => (
        <GuideCard
          key={guide.id}
          guide={guide}
          onStepToggle={(stepId, completed) =>
            updateStep(guide.id, stepId, completed)
          }
          isUpdating={isUpdating}
        />
      ))}
    </div>
  )
}

function GuideCard({
  guide,
  onStepToggle,
  isUpdating,
}: {
  guide: Guide
  onStepToggle: (stepId: string, completed: boolean) => void
  isUpdating: boolean
}) {
  const completed = guide.steps.filter((s: { completed: boolean }) => s.completed).length
  const progress =
    guide.steps.length > 0 ? (completed / guide.steps.length) * 100 : 0
  const allDone = completed === guide.steps.length

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-lg">{guide.title}</CardTitle>
        <CardDescription>{guide.summary}</CardDescription>
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>
              {completed} of {guide.steps.length} steps
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {guide.steps.map((step: { id: string; label: string; completed: boolean }) => (
          <button
            key={step.id}
            type="button"
            onClick={() => !isUpdating && onStepToggle(step.id, !step.completed)}
            disabled={isUpdating}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm transition-all duration-200',
              'hover:border-primary/30 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              step.completed && 'border-success/30 bg-success/5'
            )}
          >
            {step.completed ? (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20">
                <Check className="h-3 w-3 text-success" aria-hidden />
              </div>
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-muted">
                <Circle className="h-3 w-3 text-muted-foreground" aria-hidden />
              </div>
            )}
            <span
              className={cn(
                'flex-1 font-medium',
                step.completed && 'text-muted-foreground line-through'
              )}
            >
              {step.label}
            </span>
          </button>
        ))}
        <div className="pt-2">
          <Button
            variant={allDone ? 'secondary' : 'default'}
            size="sm"
            className="w-full gap-2"
          >
            <Play className="h-4 w-4" />
            {allDone ? 'Review guide' : 'Resume'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
