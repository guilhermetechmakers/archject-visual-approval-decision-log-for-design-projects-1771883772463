/**
 * CommentsThread - Threaded comments with mentions, edit/delete, moderation
 * Supports nested replies, @mention highlighting, edit window, soft delete
 */

import { useState, useCallback } from 'react'
import { MessageSquare, Send, Pencil, Trash2, AtSign } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { DecisionComment } from '@/types/decision-detail'

const EDIT_WINDOW_MINUTES = 15

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

function canEditComment(comment: DecisionComment, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false
  if (comment.status === 'deleted') return false
  const createdAt = new Date(comment.createdAt).getTime()
  const windowEnd = createdAt + EDIT_WINDOW_MINUTES * 60 * 1000
  return comment.authorId === currentUserId && Date.now() < windowEnd
}

/** Renders comment content with @mentions highlighted */
function CommentContent({ content, mentions }: { content: string; mentions: string[] }) {
  if (!content) return null
  const mentionSet = new Set(mentions.map((m) => m.toLowerCase()))
  const parts = content.split(/(@\w+)/g)
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const handle = part.slice(1)
          const isMention = mentionSet.has(handle.toLowerCase()) || /^\w+$/.test(handle)
          return (
            <span
              key={i}
              className={cn(
                isMention && 'inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-primary'
              )}
            >
              {isMention && <AtSign className="h-3 w-3" />}
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

export interface CommentsThreadProps {
  comments: DecisionComment[]
  onAddComment?: (content: string, parentId?: string | null, mentions?: string[]) => void
  onEditComment?: (commentId: string, content: string, mentions?: string[]) => void
  onDeleteComment?: (commentId: string) => void
  currentUserId?: string
  isLoading?: boolean
  className?: string
}

export function CommentsThread({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  isLoading: _isLoading = false,
  className,
}: CommentsThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rootComments = comments.filter((c) => !c.parentCommentId)
  const getReplies = (id: string) =>
    comments.filter((c) => c.parentCommentId === id)

  const handleSubmit = useCallback(async () => {
    const content = newComment.trim()
    if (!content || !onAddComment) return
    setIsSubmitting(true)
    try {
      const mentions = content.match(/@(\w+)/g)?.map((m) => m.slice(1)) ?? []
      await onAddComment(content, replyingTo ?? undefined, mentions)
      setNewComment('')
      setReplyingTo(null)
    } finally {
      setIsSubmitting(false)
    }
  }, [newComment, onAddComment, replyingTo])

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
          Threaded discussions with @mentions. Edit within 15 minutes.
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
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {onAddComment && (
          <div className="space-y-2">
            {replyingTo && (
              <p className="text-xs text-muted-foreground">Replying to comment</p>
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
                className="shrink-0 self-end transition-all duration-200 hover:scale-[1.02]"
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
  onEdit?: (commentId: string, content: string, mentions?: string[]) => void
  onDelete?: (commentId: string) => void
  currentUserId?: string
}

function CommentItem({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSaving, setIsSaving] = useState(false)

  const authorName = comment.authorName ?? comment.authorId
  const isDeleted = comment.status === 'deleted'
  const isEdited = comment.status === 'edited' || !!comment.editedAt
  const canEdit = canEditComment(comment, currentUserId) && onEdit && !isDeleted

  const handleSaveEdit = useCallback(async () => {
    const content = editContent.trim()
    if (!content || !onEdit) return
    setIsSaving(true)
    try {
      const mentions = content.match(/@(\w+)/g)?.map((m) => m.slice(1)) ?? []
      await onEdit(comment.id, content, mentions)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }, [comment.id, editContent, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditContent(comment.content)
    setIsEditing(false)
  }, [comment.content])

  if (isDeleted) {
    return (
      <div className="space-y-2">
        <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              ?
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-sm italic text-muted-foreground">
              [Comment deleted]
            </span>
          </div>
        </div>
        {replies.length > 0 && (
          <div className="ml-8 space-y-2 border-l-2 border-border pl-4">
            {replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                replies={[]}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-all duration-200 hover:border-border/80">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            {canEdit && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    aria-label="Comment actions"
                  >
                    <span className="sr-only">Actions</span>
                    <span className="text-muted-foreground">⋯</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                disabled={isSaving}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || isSaving}
                >
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-foreground">
              <CommentContent content={comment.content} mentions={comment.mentions} />
            </p>
          )}
          {!isEditing && onReply && (
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
        <div className="ml-8 space-y-2 border-l-2 border-primary/20 pl-4">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              replies={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
