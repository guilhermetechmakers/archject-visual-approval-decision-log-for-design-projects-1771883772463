import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface VerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requireOtp?: boolean
  onVerifyOtp?: (email: string, otp: string) => Promise<boolean>
  onSendOtp?: (email: string) => Promise<boolean>
  onSkip?: () => void
  onNameCapture?: (name: string) => void
  allowSkip?: boolean
  allowRemember?: boolean
  className?: string
}

type Step = 'email' | 'otp' | 'name'

export function VerificationModal({
  open,
  onOpenChange,
  requireOtp = false,
  onVerifyOtp,
  onSendOtp,
  onSkip,
  onNameCapture,
  allowSkip = true,
  allowRemember = true,
  className,
}: VerificationModalProps) {
  const [step, setStep] = useState<Step>(requireOtp ? 'email' : 'name')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async () => {
    const trimmed = email.trim()
    if (!trimmed || !onSendOtp) return
    setIsLoading(true)
    setError(null)
    try {
      const sent = await onSendOtp(trimmed)
      if (sent) {
        setStep('otp')
      } else {
        setError('Failed to send code. Please try again.')
      }
    } catch {
      setError('Failed to send code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !onVerifyOtp) return
    setIsLoading(true)
    setError(null)
    try {
      const verified = await onVerifyOtp(email.trim(), otp.trim())
      if (verified) {
        onOpenChange(false)
      } else {
        setError('Invalid code. Please try again.')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = () => {
    const trimmed = name.trim()
    if (trimmed && onNameCapture) {
      onNameCapture(trimmed)
    }
    onOpenChange(false)
  }

  const handleSkip = () => {
    onSkip?.()
    onOpenChange(false)
  }

  const handleClose = () => {
    setStep(requireOtp ? 'email' : 'name')
    setEmail('')
    setOtp('')
    setName('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn('max-w-md', className)}
        aria-describedby="verification-description"
      >
        <DialogHeader>
          <DialogTitle>
            {step === 'email' && 'Verify your email'}
            {step === 'otp' && 'Enter verification code'}
            {step === 'name' && 'Your name (optional)'}
          </DialogTitle>
          <DialogDescription id="verification-description">
            {step === 'email' &&
              'We\'ll send a one-time code to verify your identity.'}
            {step === 'otp' &&
              'Enter the 6-digit code we sent to your email.'}
            {step === 'name' &&
              'Provide your name for the approval record.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          {step === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="verify-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="verify-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {allowRemember && (
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="remember"
                    checked={remember}
                    onCheckedChange={setRemember}
                  />
                  <Label htmlFor="remember" className="font-normal">
                    Remember this device
                  </Label>
                </div>
              )}
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-2">
              <Label htmlFor="verify-otp">Verification code</Label>
              <Input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-[0.5em]"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Code sent to {email}
              </p>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-2">
              <Label htmlFor="verify-name">Your name</Label>
              <Input
                id="verify-name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {allowSkip && step !== 'otp' && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'email' && (
            <Button
              onClick={handleSendOtp}
              disabled={!email.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send code'
              )}
            </Button>
          )}
          {step === 'otp' && (
            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </Button>
          )}
          {step === 'name' && (
            <Button onClick={handleNameSubmit} disabled={isLoading}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
