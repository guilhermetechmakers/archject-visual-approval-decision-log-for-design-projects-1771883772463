/**
 * 500 Internal Server Error page - graceful error experience.
 * - Retry mechanism with debounce and loading state
 * - Support contact panel with optional inline form
 * - Optional error details drawer (sanitized, no sensitive data)
 * - Brand-consistent illustration and design system
 */

import { useCallback, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'
import { NavigationHeader } from '@/components/layout/navigation-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ServerErrorIllustration } from '@/components/illustrations'
import { submitSupportTicket, openSupportMailto } from '@/api/support'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const RETRY_DEBOUNCE_MS = 2000
const RETRY_RELOAD_DELAY_MS = 400
const MIN_NAME_LEN = 3
const MAX_NAME_LEN = 100
const MIN_MESSAGE_LEN = 10
const MAX_MESSAGE_LEN = 1000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false)
  const lastRetryRef = useRef<number>(0)

  const retry = useCallback(() => {
    const now = Date.now()
    if (now - lastRetryRef.current < RETRY_DEBOUNCE_MS) {
      toast.error('Please wait a moment before retrying.')
      return
    }
    lastRetryRef.current = now
    setIsRetrying(true)
    toast.loading('Retrying...', { id: 'server-error-retry' })
    setTimeout(() => {
      window.location.reload()
    }, RETRY_RELOAD_DELAY_MS)
  }, [])

  return { retry, isRetrying }
}

function SupportContactPanel() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const nameError =
    name.length > 0 && name.length < MIN_NAME_LEN
      ? `Name must be at least ${MIN_NAME_LEN} characters`
      : name.length > MAX_NAME_LEN
        ? `Name must be ${MAX_NAME_LEN} characters or less`
        : null
  const emailError =
    email.length > 0 && !EMAIL_REGEX.test(email)
      ? 'Please enter a valid email address'
      : null
  const messageError =
    message.length > 0 && message.length < MIN_MESSAGE_LEN
      ? `Message must be at least ${MIN_MESSAGE_LEN} characters`
      : message.length > MAX_MESSAGE_LEN
        ? `Message must be ${MAX_MESSAGE_LEN} characters or less`
        : null

  const canSubmit =
    name.trim().length >= MIN_NAME_LEN &&
    name.trim().length <= MAX_NAME_LEN &&
    EMAIL_REGEX.test(email.trim()) &&
    message.trim().length >= MIN_MESSAGE_LEN &&
    message.trim().length <= MAX_MESSAGE_LEN

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await submitSupportTicket({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })

      if (result) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setMessage('')
        toast.success('Support request submitted. We\'ll get back to you soon.')
      } else {
        openSupportMailto(name.trim(), email.trim(), message.trim())
        setSubmitted(true)
        toast.success('Opened your email client. Send the message to contact support.')
      }
    } catch {
      openSupportMailto(name.trim(), email.trim(), message.trim())
      setSubmitted(true)
      toast.success('Opened your email client. Send the message to contact support.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMailto = () => {
    openSupportMailto('', '', 'I encountered a 500 error and need assistance.')
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl border border-border bg-muted/30 p-6"
        role="region"
        aria-label="Support contact confirmation"
      >
        <p className="text-sm font-medium text-foreground">
          Thank you for reaching out.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve received your message and will respond as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Support contact options"
    >
      <p className="text-sm text-muted-foreground">
        Need help? Contact our support team.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleMailto}
          aria-label="Contact support via email"
          className="min-h-[48px] min-w-[48px]"
        >
          <HelpCircle className="h-5 w-5" />
          Email Support
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
          aria-label={showForm ? 'Hide contact form' : 'Show contact form'}
          className="min-h-[48px] min-w-[48px]"
        >
          {showForm ? 'Hide form' : 'Submit a ticket'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="support-name">Name *</Label>
            <Input
              id="support-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={MAX_NAME_LEN + 1}
              className={cn(nameError && 'border-destructive')}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-error' : undefined}
            />
            <div className="flex justify-between text-xs">
              <span id="name-error" className="text-destructive">
                {nameError}
              </span>
              <span className="text-muted-foreground">
                {name.length}/{MAX_NAME_LEN}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email *</Label>
            <Input
              id="support-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(emailError && 'border-destructive')}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            <span id="email-error" className="text-xs text-destructive">
              {emailError}
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message *</Label>
            <Textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue (10–1000 characters)"
              rows={4}
              maxLength={MAX_MESSAGE_LEN + 1}
              className={cn(messageError && 'border-destructive')}
              aria-invalid={!!messageError}
              aria-describedby={messageError ? 'message-error' : undefined}
            />
            <div className="flex justify-between text-xs">
              <span id="message-error" className="text-destructive">
                {messageError}
              </span>
              <span className="text-muted-foreground">
                {message.length}/{MAX_MESSAGE_LEN}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="min-h-[48px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

function RetryLoadingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center gap-6 rounded-2xl bg-card p-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-label="Retrying, please wait"
    >
      <Skeleton className="h-[180px] w-[180px] shrink-0 rounded-2xl" aria-hidden />
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <Skeleton className="h-8 w-64" aria-hidden />
        <Skeleton className="h-5 w-full max-w-sm" aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-40 rounded-lg" aria-hidden />
        <Skeleton className="h-4 w-28" aria-hidden />
      </div>
      <div className="mt-4 w-full border-t border-border pt-6">
        <Skeleton className="mb-3 h-4 w-20" aria-hidden />
        <Skeleton className="h-10 w-32 rounded-lg" aria-hidden />
      </div>
    </div>
  )
}

function ErrorDetailsDrawer({ sanitizedMessage }: { sanitizedMessage?: string }) {
  const [open, setOpen] = useState(false)

  if (!sanitizedMessage) return null

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        id="error-details-trigger"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-6 py-4 text-left text-sm font-medium text-muted-foreground hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-expanded={open}
        aria-controls="error-details-content"
        aria-label={open ? 'Hide technical error details' : 'Show technical error details'}
      >
        <span>Technical details</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
      </button>
      <div
        id="error-details-content"
        role="region"
        aria-labelledby="error-details-trigger"
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-border px-6 py-4">
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
            {sanitizedMessage}
          </pre>
        </div>
      </div>
    </div>
  )
}

export function ServerErrorPage() {
  const { retry, isRetrying } = useRetry()
  const location = useLocation()
  const state = location.state as { errorMessage?: string } | undefined
  const sanitizedMessage = state?.errorMessage
    ? String(state.errorMessage).slice(0, 200)
    : undefined

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24"
        role="main"
      >
        <Card
          className={cn(
            'relative w-full max-w-xl shadow-card rounded-2xl p-6 md:p-8',
            'animate-fade-in-up'
          )}
        >
          {isRetrying && <RetryLoadingOverlay />}
          <CardContent
            className={cn(
              'flex flex-col items-center gap-6 p-0',
              isRetrying && 'pointer-events-none opacity-60'
            )}
          >
            <ServerErrorIllustration size={180} className="shrink-0" />

            <div
              className="text-center space-y-2"
              role="alert"
              aria-live="polite"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                500 Internal Server Error
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                Something went wrong on our servers. We&apos;re working to fix
                it. Please try again in a moment.
              </p>
            </div>

            <div className="w-full flex flex-col items-center gap-4">
              <Button
                size="lg"
                onClick={retry}
                disabled={isRetrying}
                aria-label="Retry loading the page"
                className="min-h-[48px] min-w-[160px]"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Return to home
              </Link>
            </div>

            <div className="w-full pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Support
              </h2>
              <SupportContactPanel />
            </div>

            <ErrorDetailsDrawer sanitizedMessage={sanitizedMessage} />
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-md">
          If the issue persists, we typically resolve server errors within a few
          hours. Check our status page or contact support for updates.
        </p>
      </main>
    </div>
  )
}
