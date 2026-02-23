import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockOptions = [
  { id: 'a', title: 'Option A', description: 'Natural oak finish with matte seal' },
  { id: 'b', title: 'Option B', description: 'White laminate with gloss finish' },
]

export function ClientPortalPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [approved, setApproved] = useState(false)
  const [, setCompareIndex] = useState(0)

  if (approved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Approval received</h2>
            <p className="mt-2 text-muted-foreground">
              Thank you for your decision. The studio has been notified.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              You can close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">Archject</span>
          <span className="text-sm text-muted-foreground">Kitchen finish options</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Kitchen finish options</h1>
            <p className="mt-1 text-muted-foreground">
              Please review the options below and select your preferred choice.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visual comparison</CardTitle>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Swipe or use arrows to compare
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCompareIndex((i) => (i === 0 ? 1 : 0))}
                  className="shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="grid flex-1 grid-cols-2 gap-4">
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                    Option A
                  </div>
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                    Option B
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCompareIndex((i) => (i === 0 ? 1 : 0))}
                  className="shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select your choice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedOption === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          selectedOption === opt.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      />
                      <span className="font-medium">{opt.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Button variant="outline">Request changes</Button>
            <Button
              disabled={!selectedOption}
              onClick={() => setApproved(true)}
            >
              Approve selection
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
