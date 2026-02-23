import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useChangelog } from '@/hooks/use-help'
import type { ChangelogEntry } from '@/types/help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ChangelogSection() {
  const { data: changelog, isLoading } = useChangelog()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border shadow-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Changelog & Release Notes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent product updates and improvements
          </p>
        </CardContent>
      </Card>

      <Accordion
        type="single"
        collapsible
        defaultValue={changelog?.[0]?.version}
        className="space-y-4"
      >
        {changelog?.map((entry: ChangelogEntry, index: number) => (
          <AccordionItem
            key={entry.version}
            value={entry.version}
            className={cn(
              'rounded-2xl border border-b-0 shadow-card transition-all duration-200 overflow-hidden last:border-b',
              index === 0
                ? 'border-primary/30 bg-primary/5'
                : 'border-border hover:shadow-card-hover'
            )}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex flex-wrap items-center gap-3 text-left">
                <Badge
                  variant={index === 0 ? 'default' : 'secondary'}
                  className="font-mono"
                >
                  v{entry.version}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(entry.date)}
                </span>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs">
                    Latest
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-0">
              <div
                className={cn(
                  'prose prose-sm max-w-none dark:prose-invert',
                  'prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground'
                )}
              >
                {entry.notes.split('\n').map((line: string, i: number) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h3
                        key={i}
                        className="mt-4 text-base font-semibold text-foreground first:mt-0"
                      >
                        {line.slice(3)}
                      </h3>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="ml-4 text-muted-foreground">
                        {line.slice(2)}
                      </li>
                    )
                  }
                  if (line.trim()) {
                    return (
                      <p key={i} className="text-muted-foreground">
                        {line}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
