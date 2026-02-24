/**
 * SMS Enrollment - Phone number input and OTP verification
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTwoFAEnrollSMS, useTwoFAVerifySMS } from '@/hooks/use-two-fa'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const E164_REGEX = /^\+[1-9]\d{1,14}$/

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .refine((v) => E164_REGEX.test(v.replace(/\s/g, '')) || /^\d{10,15}$/.test(v.replace(/\D/g, '')), {
      message: 'Enter a valid phone number (e.g. +1234567890)',
    }),
})

const codeSchema = z.object({
  code: z.string().length(6, 'Enter 6-digit code').regex(/^\d{6}$/, 'Code must be 6 digits'),
})

type PhoneForm = z.infer<typeof phoneSchema>
type CodeForm = z.infer<typeof codeSchema>

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10 && !digits.startsWith('1')) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  return input.startsWith('+') ? input : `+${input}`
}

interface TwoFASMSEnrollmentProps {
  onCancel: () => void
  onSuccess: () => void
}

export function TwoFASMSEnrollment({ onCancel, onSuccess }: TwoFASMSEnrollmentProps) {
  const [phoneSent, setPhoneSent] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  const enrollMutation = useTwoFAEnrollSMS()
  const verifyMutation = useTwoFAVerifySMS()

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' },
  })

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const handleSendCode = async (data: PhoneForm) => {
    try {
      const normalized = normalizePhone(data.phoneNumber)
      await enrollMutation.mutateAsync(normalized)
      setPhoneSent(true)
      toast.success('Verification code sent')
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Failed to send code')
    }
  }

  const handleVerify = async (data: CodeForm) => {
    try {
      const res = await verifyMutation.mutateAsync(data.code) as { recoveryCodes?: string[]; message?: string }
      if (res.recoveryCodes?.length) {
        setRecoveryCodes(res.recoveryCodes)
      } else {
        toast.success(res.message ?? 'Two-factor authentication enabled')
        onSuccess()
      }
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Invalid code')
    }
  }

  const handleRecoveryCodesDone = () => {
    setRecoveryCodes(null)
    toast.success('Two-factor authentication enabled')
    onSuccess()
  }

  if (recoveryCodes?.length) {
    return (
      <div className="space-y-4 rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-warning-muted">
          Save these recovery codes. Each can be used once if you lose access to your phone.
        </p>
        <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
          {recoveryCodes.map((code, i) => (
            <div key={i} className="rounded bg-muted px-3 py-2">
              {code}
            </div>
          ))}
        </div>
        <Button onClick={handleRecoveryCodesDone}>I&apos;ve saved my codes</Button>
      </div>
    )
  }

  if (!phoneSent) {
    return (
      <form
        onSubmit={phoneForm.handleSubmit(handleSendCode)}
        className="space-y-4 rounded-lg border border-border p-4"
      >
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number (E.164)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            {...phoneForm.register('phoneNumber')}
            className={cn(phoneForm.formState.errors.phoneNumber && 'border-destructive')}
          />
          {phoneForm.formState.errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {phoneForm.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={enrollMutation.isPending}>
            {enrollMutation.isPending ? 'Sending...' : 'Send verification code'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form
      onSubmit={codeForm.handleSubmit(handleVerify)}
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-2">
        <Label htmlFor="sms-code">Enter 6-digit code</Label>
        <Input
          id="sms-code"
          placeholder="000000"
          maxLength={6}
          autoComplete="one-time-code"
          {...codeForm.register('code')}
          className={cn(
            'font-mono text-lg tracking-widest',
            codeForm.formState.errors.code && 'border-destructive'
          )}
        />
        {codeForm.formState.errors.code && (
          <p className="text-sm text-destructive">{codeForm.formState.errors.code.message}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? 'Verifying...' : 'Verify and enable'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPhoneSent(false)
            codeForm.reset()
          }}
        >
          Use different number
        </Button>
      </div>
    </form>
  )
}
