import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKnowledgeBase, useArticle } from '@/hooks/use-help'
import { useDebounce } from '@/hooks/use-debounce'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Article } from '@/types/help'

const CATEGORIES = ['All', 'General', 'Sharing', 'Exports', 'Billing', 'Integrations']

export function KnowledgeBaseSection() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 250)
  const { data, isLoading } = useKnowledgeBase(debouncedQuery, category, page)
  const { data: article, isLoading: articleLoading } = useArticle(selectedArticleId)

  const articles = data?.articles ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 10) || 1

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Knowledge Base</CardTitle>
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Search knowledge base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-label={`Filter by ${cat} category`}
                aria-pressed={category === cat}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No articles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onClick={() => setSelectedArticleId(a.id)}
                />
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Go to previous page"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Go to next page"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedArticleId} onOpenChange={() => setSelectedArticleId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {article?.title ?? 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {articleLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : article ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {article.readTime} read
                  </span>
                </div>
                <ArticleContent content={article.content} />
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ArticleCard({
  article,
  onClick,
}: {
  article: Article
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Read article: ${article.title}`}
      className={cn(
        'w-full rounded-xl border border-border p-4 text-left transition-all duration-200',
        'hover:border-primary/30 hover:bg-secondary/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground">{article.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
            {article.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">
          {article.readTime}
        </div>
      </div>
    </button>
  )
}

function ArticleContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/)
          const code = match?.[2] ?? part
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-lg bg-muted p-4 text-sm"
            >
              <code>{code.trim()}</code>
            </pre>
          )
        }
        const blocks = part.split(/\n\n+/)
        return (
          <div key={i} className="space-y-3 text-sm leading-relaxed">
            {blocks.map((block, j) => {
              const trimmed = block.trim()
              if (!trimmed) return null
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={j} className="text-lg font-semibold mt-6 mb-2">
                    {trimmed.slice(2)}
                  </h2>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={j} className="text-base font-semibold mt-4 mb-2">
                    {trimmed.slice(3)}
                  </h3>
                )
              }
              if (trimmed.startsWith('- ')) {
                const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
                return (
                  <ul key={j} className="list-disc pl-6 space-y-1">
                    {items.map((item, k) => (
                      <li key={k}>{item.slice(2)}</li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={j} className="mb-2">
                  {trimmed}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
