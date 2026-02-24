/**
 * TOTP enrollment flow - QR code, secret, verify
 */

import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTwoFASetupTOTP, useTwoFAVerifyTOTP } from '@/hooks/use-two-fa'
import { toast } from 'sonner'

interface Props {
  onCancel: () => void
  onSuccess: () => void
}

export function TwoFATOTPEnrollment({ onCancel, onSuccess }: Props) {
  const setupMutation = useTwoFASetupTOTP()
  const verifyMutation = useTwoFAVerifyTOTP()
  const [totpSetup, setTotpSetup] = React.useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [code, setCode] = React.useState('')
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null)

  const handleSetup = async () => {
    try {
      const res = await setupMutation.mutateAsync() as { secret: string; otpauthUrl: string }
      setTotpSetup({ secret: res.secret, otpauthUrl: res.otpauthUrl })
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Failed to setup')
    }
  }

  const handleVerify = async () => {
    if (!totpSetup || !/^\d{6}$/.test(code)) {
      toast.error('Enter a valid 6-digit code')
      return
    }
    try {
      const res = await verifyMutation.mutateAsync({ code, secret: totpSetup.secret }) as { recoveryCodes?: string[] }
      if (res.recoveryCodes?.length) {
        setRecoveryCodes(res.recoveryCodes)
      } else {
        toast.success('2FA enabled')
        onSuccess()
      }
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Invalid code')
    }
  }

  if (recoveryCodes?.length) {
    return (
      <div className="space-y-4 rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-warning-muted">
          Save these recovery codes. Each can be used once if you lose access to your authenticator.
        </p>
        <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
          {recoveryCodes.map((c, i) => (
            <div key={i} className="rounded bg-muted px-3 py-2">{c}</div>
          ))}
        </div>
        <Button onClick={() => { setRecoveryCodes(null); onSuccess() }}>I&apos;ve saved my codes</Button>
      </div>
    )
  }

  if (!totpSetup) {
    return (
      <div className="space-y-4 rounded-lg border border-border p-4">
        <Button onClick={handleSetup} disabled={setupMutation.isPending}>
          {setupMutation.isPending ? 'Generating...' : 'Generate QR code'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Scan with your authenticator app</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex justify-center rounded-lg border border-border bg-white p-4">
          <QRCodeSVG value={totpSetup.otpauthUrl} size={160} level="M" includeMargin role="img" aria-label="QR code for authenticator" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Or enter manually</Label>
            <p className="mt-1 font-mono text-sm break-all">{totpSetup.secret}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totp-code">Enter 6-digit code</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ''))}
              className="max-w-[140px] font-mono text-lg tracking-widest"
            />
            <Button
              onClick={handleVerify}
              disabled={code.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify and enable'}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
