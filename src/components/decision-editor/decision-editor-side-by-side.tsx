import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  VisualSideBySideViewer,
  toComparisonOptionsFromEditor,
} from '@/components/visual-comparison-viewer'
import { useDecisionEditor } from '@/contexts/decision-editor-context'

export interface DecisionEditorSideBySideProps {
  onNext?: () => void
}

export function DecisionEditorSideBySide({ onNext }: DecisionEditorSideBySideProps) {
  const { options, setStep } = useDecisionEditor()
  const comparisonOptions = toComparisonOptionsFromEditor(options)
  const optionsWithMedia = options.filter((o) => o.mediaFiles.length > 0)

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Side-by-side comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Arrange options, designate primary media. Supports zoom, pan, and synchronized view across panes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {optionsWithMedia.length < 2 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-muted-foreground">
            Add at least 2 options with media in the previous step to compare here.
          </div>
        ) : (
          <VisualSideBySideViewer
            options={comparisonOptions}
            layout="adaptive"
            syncPanZoom
            showThumbnails
          />
        )}

        <p className="text-xs text-muted-foreground">
          On mobile: pinch to zoom, swipe to pan. Use arrow keys to navigate, +/- to zoom.
        </p>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => (onNext ? onNext() : setStep('approval'))}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Next: Approval Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
