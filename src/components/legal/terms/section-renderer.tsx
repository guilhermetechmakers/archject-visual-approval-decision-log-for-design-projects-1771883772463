import type { LegalSection, ContentBlock } from '@/types/legal'
import { cn } from '@/lib/utils'

export interface SectionRendererProps
  extends React.HTMLAttributes<HTMLElement> {
  section: LegalSection
  className?: string
}

function renderContentBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className="leading-relaxed text-foreground [&:not(:last-child)]:mb-4"
        >
          {block.content}
        </p>
      )
    case 'subheading':
      return (
        <h3
          key={index}
          className="mb-2 mt-6 text-base font-semibold text-foreground"
        >
          {block.content}
        </h3>
      )
    case 'list':
      return (
        <ul
          key={index}
          className="mb-4 ml-6 list-disc space-y-2 text-foreground marker:text-muted-foreground"
          role="list"
        >
          {block.bulletPoints?.map((item, i) => (
            <li key={i} className="leading-relaxed pl-1">
              {item}
            </li>
          ))}
        </ul>
      )
    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="mb-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
        >
          {block.content}
        </blockquote>
      )
    case 'link':
      return (
        <p key={index} className="mb-4">
          {block.links?.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {link.text}
            </a>
          ))}
        </p>
      )
    default:
      return null
  }
}

export function SectionRenderer({
  section,
  className,
  style,
  ...props
}: SectionRendererProps) {
  return (
    <section
      id={section.id}
      className={cn('scroll-mt-24', className)}
      style={style}
      aria-labelledby={`section-${section.id}`}
      {...props}
    >
      <h2
        id={`section-${section.id}`}
        className="mb-4 text-xl font-semibold text-foreground"
      >
        {section.title}
      </h2>
      <div className="space-y-2">
        {section.contentBlocks.map((block, index) =>
          renderContentBlock(block, index)
        )}
      </div>
    </section>
  )
}
