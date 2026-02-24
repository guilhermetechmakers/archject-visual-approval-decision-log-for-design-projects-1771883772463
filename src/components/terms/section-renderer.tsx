import type { ContentBlock, LegalSection } from '@/types/legal'
import { cn } from '@/lib/utils'

export interface SectionRendererProps {
  section: LegalSection
  className?: string
  style?: React.CSSProperties
}

function renderContentBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className="leading-relaxed text-foreground"
          style={{ lineHeight: 1.7 }}
        >
          {block.content}
        </p>
      )
    case 'subheading':
      return (
        <h3
          key={index}
          className="mt-6 mb-2 text-base font-semibold text-foreground"
        >
          {block.content}
        </h3>
      )
    case 'list':
      return (
        <ul
          key={index}
          className="my-4 ml-6 list-disc space-y-2 text-foreground"
          style={{ lineHeight: 1.7 }}
        >
          {block.bulletPoints?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="my-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
        >
          {block.content}
        </blockquote>
      )
    case 'link':
      return (
        <p key={index} className="my-2">
          <a
            href={block.links?.[0]?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            {block.links?.[0]?.text ?? block.content}
          </a>
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
}: SectionRendererProps) {
  return (
    <section
      id={section.id}
      className={cn('scroll-mt-24', className)}
      style={style}
      aria-labelledby={`section-${section.id}`}
    >
      <h2
        id={`section-${section.id}`}
        className="text-xl font-semibold text-foreground md:text-2xl"
      >
        {section.title}
      </h2>
      <div className="mt-4 space-y-4">
        {section.contentBlocks.map((block, index) =>
          renderContentBlock(block, index)
        )}
      </div>
    </section>
  )
}
