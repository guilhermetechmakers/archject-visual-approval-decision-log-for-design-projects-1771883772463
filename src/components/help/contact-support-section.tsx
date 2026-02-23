import { useState, useRef } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useContactSupport } from '@/hooks/use-help'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_SUBJECT = 100
const MAX_DESCRIPTION = 2000
const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export function ContactSupportSection() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { submit, isSubmitting } = useContactSupport()

  const subjectError =
    subject.length > MAX_SUBJECT
      ? `Subject must be ${MAX_SUBJECT} characters or less`
      : null
  const descriptionError =
    description.length > MAX_DESCRIPTION
      ? `Description must be ${MAX_DESCRIPTION} characters or less`
      : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      return
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_SIZE_MB}MB`)
      setFile(null)
      e.target.value = ''
      return
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('File type not allowed. Use images, PDFs, or documents.')
      setFile(null)
      e.target.value = ''
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subjectError || descriptionError) return
    if (!subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!description.trim()) {
      toast.error('Description is required')
      return
    }

    try {
      await submit({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        attachmentName: file?.name,
      })
      setSubmitted(true)
      setSubject('')
      setDescription('')
      setPriority('Medium')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Support request submitted successfully')
    } catch {
      toast.error('Failed to submit. Please try again.')
    }
  }

  const handleReset = () => {
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <CheckCircle className="h-8 w-8 text-success" aria-hidden />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Request submitted</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            We&apos;ve received your support request and will get back to you
            soon. You&apos;ll receive an email confirmation.
          </p>
          <Button variant="outline" className="mt-6" onClick={handleReset}>
            Submit another request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">Contact Support</CardTitle>
        <CardDescription>
          Describe your issue and we&apos;ll get back to you as soon as
          possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              maxLength={MAX_SUBJECT + 1}
              className={cn(subjectError && 'border-destructive')}
              aria-invalid={!!subjectError}
              aria-describedby={subjectError ? 'subject-error' : undefined}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="subject-error" className="text-destructive">
                {subjectError}
              </span>
              <span>{subject.length}/{MAX_SUBJECT}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your issue..."
              rows={5}
              maxLength={MAX_DESCRIPTION + 1}
              className={cn(descriptionError && 'border-destructive')}
              aria-invalid={!!descriptionError}
              aria-describedby={
                descriptionError ? 'description-error' : undefined
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span id="description-error" className="text-destructive">
                {descriptionError}
              </span>
              <span>{description.length}/{MAX_DESCRIPTION}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) =>
                setPriority(v as 'Low' | 'Medium' | 'High')
              }
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Attachment (optional)</Label>
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-colors',
                'hover:border-primary/30 hover:bg-secondary/30',
                file && 'border-primary/30 bg-primary/5'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
                id="attachment"
                aria-label="Attach file"
              />
              <label
                htmlFor="attachment"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {file
                    ? file.name
                    : 'Drag and drop or click to browse'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Max {MAX_FILE_SIZE_MB}MB. Images, PDF, DOC.
                </span>
              </label>
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="mt-2 flex items-center gap-1 text-sm text-destructive hover:underline"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubject('')
                setDescription('')
                setPriority('Medium')
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
