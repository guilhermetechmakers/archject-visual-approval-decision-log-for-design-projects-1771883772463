/**
 * 2FA Toggle Card - Enable/disable 2FA with status badge and enrollment flows
 * Integrates TOTP and SMS enrollment, recovery codes, and audit log
 */

import { useState } from 'react'
import { ShieldCheck, Smartphone, MessageSquare, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTwoFAStatus, useTwoFADisable } from '@/hooks/use-two-fa'
import { isSupabaseConfigured } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TwoFATOTPEnrollment } from './two-fa-totp-enrollment'
import { TwoFASMSEnrollment } from './two-fa-sms-enrollment'
import { TwoFARecoveryCodes } from './two-fa-recovery-codes'
import { TwoFAAuditLog } from './two-fa-audit-log'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'


export function TwoFACard() {
  const { data: status, isLoading } = useTwoFAStatus()
  const disableMutation = useTwoFADisable()
  const [enrollmentMethod, setEnrollmentMethod] = useState<'totp' | 'sms' | null>(null)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')

  const isEnabled = status?.isEnabled ?? false
  const method = status?.method ?? null

  const handleDisable = async () => {
    if (!disablePassword.trim()) return
    try {
      await disableMutation.mutateAsync(disablePassword)
      toast.success('Two-factor authentication has been disabled')
      setShowDisableConfirm(false)
      setDisablePassword('')
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Failed to disable 2FA')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Two-factor authentication</CardTitle>
          </div>
          <CardDescription>
            Configure 2FA when Supabase is connected
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Two-factor authentication</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Learn more about 2FA"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    Add an extra layer of security. Use an authenticator app (recommended) or SMS.
                    Save recovery codes in a safe place—they can restore access if you lose your device.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-20 rounded-full" />
          ) : (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                isEnabled
                  ? 'bg-success/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </div>
        <CardDescription>
          Authenticator app or SMS verification for sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        ) : isEnabled ? (
          <>
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                {method === 'totp' ? (
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {method === 'totp' ? 'Authenticator app' : 'SMS'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {method === 'sms' && status?.phoneNumber
                      ? `Verified: ${status.phoneNumber}`
                      : 'Active'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisableConfirm(true)}
                className="ml-auto"
              >
                Disable 2FA
              </Button>
            </div>
            <TwoFARecoveryCodes />
            <TwoFAAuditLog />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Choose how you want to receive verification codes:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setEnrollmentMethod('totp')}
                className="gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Authenticator app
              </Button>
              <Button
                variant="outline"
                onClick={() => setEnrollmentMethod('sms')}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                SMS
              </Button>
            </div>
            {enrollmentMethod === 'totp' && (
              <TwoFATOTPEnrollment
                onCancel={() => setEnrollmentMethod(null)}
                onSuccess={() => setEnrollmentMethod(null)}
              />
            )}
            {enrollmentMethod === 'sms' && (
              <TwoFASMSEnrollment
                onCancel={() => setEnrollmentMethod(null)}
                onSuccess={() => setEnrollmentMethod(null)}
              />
            )}
          </>
        )}
      </CardContent>

      <Dialog open={showDisableConfirm} onOpenChange={(open) => { setShowDisableConfirm(open); if (!open) setDisablePassword('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm. Your account will be less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="disable-pwd" className="text-sm font-medium">Password</label>
              <Input
                id="disable-pwd"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={disablePassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisablePassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableMutation.isPending || !disablePassword.trim()}
            >
              {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
