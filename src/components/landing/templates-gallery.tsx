import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface TemplateItem {
  id: string
  name: string
  description: string
  thumbnailUrl: string
}

export interface TemplatesGalleryProps {
  templates: TemplateItem[]
  className?: string
}

export function TemplatesGallery({ templates, className }: TemplatesGalleryProps) {
  const [selected, setSelected] = useState<TemplateItem | null>(null)

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
