import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

import type { LegalSection } from '@/types/legal'

export interface TocItem {
  id: string
  title: string
}

export interface TableOfContentsProps {
  items?: TocItem[]
  sections?: LegalSection[]
  className?: string
}

export function TableOfContents({
  items: itemsProp,
  sections,
  className,
}: TableOfContentsProps) {
  const items: TocItem[] =
    itemsProp ??
    sections?.map((s) => ({ id: s.id, title: s.title })) ??
    []
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

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

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'rounded-xl border border-border bg-muted/30 p-4 print:border-0 print:bg-transparent',
        className
      )}
    >
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        On this page
      </h2>
      <ul className="flex flex-col gap-1" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-secondary hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeId === item.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
