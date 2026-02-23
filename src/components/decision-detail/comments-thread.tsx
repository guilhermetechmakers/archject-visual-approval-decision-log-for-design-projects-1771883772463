import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DecisionComment } from '@/types/decision-detail'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export interface CommentsThreadProps {
  comments: DecisionComment[]
  onAddComment?: (content: string, parentId?: string | null) => void
  isLoading?: boolean
  className?: string
}

export function CommentsThread({
  comments,
  onAddComment,
  isLoading: _isLoading = false,
  className,
}: CommentsThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rootComments = comments.filter((c) => !c.parentCommentId)
  const getReplies = (id: string) =>
    comments.filter((c) => c.parentCommentId === id)

  const handleSubmit = async () => {
    const content = newComment.trim()
    if (!content || !onAddComment) return
    setIsSubmitting(true)
    try {
      await onAddComment(content, replyingTo ?? undefined)
      setNewComment('')
      setReplyingTo(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Comments & Annotations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Threaded discussions with @mentions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[280px] pr-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No comments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the conversation — add a comment below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rootComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={getReplies(comment.id)}
                  onReply={() => setReplyingTo(comment.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {onAddComment && (
          <div className="space-y-2">
            {replyingTo && (
              <p className="text-xs text-muted-foreground">
                Replying to comment
              </p>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment... Use @ to mention team members"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CommentItemProps {
  comment: DecisionComment
  replies: DecisionComment[]
  onReply?: () => void
}

function CommentItem({
  comment,
  replies,
  onReply,
}: CommentItemProps) {
  const authorName = comment.authorName ?? comment.authorId

  return (
    <div className="space-y-2">
      <div className="flex gap-3 rounded-lg border border-border bg-secondary/20 p-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          {onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={onReply}
            >
              Reply
            </Button>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-8 space-y-2 border-l-2 border-border pl-4">
          {replies.map((r) => (
            <div
              key={r.id}
              className="flex gap-2 rounded-lg border border-border bg-muted/30 p-2"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                  {getInitials(r.authorName ?? r.authorId)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium">
                  {r.authorName ?? r.authorId}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatDate(r.createdAt)}
                </span>
                <p className="mt-0.5 text-sm">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
