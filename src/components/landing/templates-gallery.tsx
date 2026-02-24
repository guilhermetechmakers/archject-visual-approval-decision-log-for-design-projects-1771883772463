import { useState } from 'react'
import { FileImage } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface TemplateItem {
  id: string
  name: string
  description: string
  thumbnailUrl: string
}

export interface TemplatesGalleryProps {
  templates: TemplateItem[]
  isLoading?: boolean
  className?: string
}

export function TemplatesGallery({
  templates,
  isLoading = false,
  className,
}: TemplatesGalleryProps) {
  const [selected, setSelected] = useState<TemplateItem | null>(null)
  const isEmpty = !isLoading && templates.length === 0

  return (
    <>
      <section
        className={cn('px-4 py-24', className)}
        aria-labelledby="templates-heading"
      >
        <div className="container mx-auto max-w-6xl">
          <h2
            id="templates-heading"
            className="text-center text-3xl font-bold text-foreground md:text-4xl"
          >
            Templates & examples
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Opinionated templates for common design choices — finishes, layouts,
            change requests.
          </p>
          {isLoading ? (
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video w-full rounded-t-xl" />
                    <div className="p-6">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <Skeleton className="mt-2 h-4 w-40" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isEmpty ? (
            <div
              className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center"
              role="status"
              aria-label="No templates available"
            >
              <FileImage className="h-12 w-12 text-muted-foreground" aria-hidden />
              <p className="mt-4 text-lg font-medium text-foreground">
                No templates yet
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Templates will appear here once they are added. Get started by
                creating your first template.
              </p>
            </div>
          ) : (
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template, i) => (
              <Card
                key={template.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                tabIndex={0}
                role="button"
                onClick={() => setSelected(template)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(template)
                  }
                }}
                style={{
                  animation: 'fade-in-up 0.4s ease-out forwards',
                  animationDelay: `${i * 80}ms`,
                  opacity: 0,
                }}
                aria-label={`View ${template.name} template`}
              >
                <CardContent className="p-0 overflow-hidden">
                  <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
                    <img
                      src={template.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <img
                src={selected.thumbnailUrl}
                alt={selected.name}
                className="w-full rounded-lg object-cover"
              />
              <p className="text-muted-foreground">{selected.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
