import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useArticle } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ArticleDetailDialogProps {
  articleId: string | null
  onClose: () => void
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function ArticleContent({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  const flushList = (ordered: boolean) => {
    if (listItems.length > 0) {
      const ListTag = ordered ? 'ol' : 'ul'
      elements.push(
        <ListTag
          key={elements.length}
          className="list-inside list-disc space-y-1 pl-4"
        >
          {listItems.map((item, i) => (
            <li key={i} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ListTag>
      )
      listItems = []
    }
  }

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      flushList(false)
      elements.push(
        <h2 key={elements.length} className="mt-4 text-lg font-semibold text-foreground">
          {escapeHtml(line.slice(2))}
        </h2>
      )
    } else if (line.startsWith('## ')) {
      flushList(false)
      elements.push(
        <h3 key={elements.length} className="mt-3 text-base font-medium text-foreground">
          {escapeHtml(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(escapeHtml(line.slice(2)))
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(escapeHtml(line.replace(/^\d+\.\s/, '')))
    } else if (line.trim()) {
      flushList(false)
      elements.push(
        <p key={elements.length} className="text-muted-foreground">
          {escapeHtml(line)}
        </p>
      )
    }
  })
  flushList(false)

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:text-foreground prose-p:text-muted-foreground'
      )}
    >
      {elements}
    </div>
  )
}

export function ArticleDetailDialog({ articleId, onClose }: ArticleDetailDialogProps) {
  const { data: article, isLoading } = useArticle(articleId)

  return (
    <Dialog open={!!articleId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        showClose={true}
      >
        <DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={onClose}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to articles
          </Button>
          {isLoading ? (
            <Skeleton className="h-7 w-3/4" />
          ) : (
            <DialogTitle className="text-xl">{article?.title}</DialogTitle>
          )}
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : article ? (
          <ArticleContent content={article.content} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
