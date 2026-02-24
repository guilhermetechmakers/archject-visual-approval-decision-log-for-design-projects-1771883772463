import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { LegalSection } from '@/types/legal'

export interface TableOfContentsProps {
  sections: LegalSection[]
  className?: string
}

export function TableOfContents({ sections, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    const elements = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    elements.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-xl border border-border bg-muted/30 p-4', className)}
    >
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        On this page
      </h2>
      <ul className="flex flex-col gap-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-secondary hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeId === section.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
