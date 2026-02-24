/**
 * Notification Integrations - SendGrid and Twilio test
 * API keys are configured via Supabase secrets (SENDGRID_API_KEY, TWILIO_*)
 */

import { Mail, Smartphone, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTestSendGrid, useTestTwilio } from '@/hooks/use-notifications'

export function NotificationIntegrationsCard() {
  const testSendGrid = useTestSendGrid()
  const testTwilio = useTestTwilio()

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Notification delivery</CardTitle>
        <CardDescription>
          SendGrid (email) and Twilio (SMS) are configured via Supabase secrets. Use Test to verify.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <Label>SendGrid (Email)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => testSendGrid.mutate(undefined)}
              disabled={testSendGrid.isPending}
              className="mt-2 w-fit transition-all duration-200 hover:scale-[1.02]"
            >
              {testSendGrid.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send test email
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <Label>Twilio (SMS)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="twilio-phone" className="text-xs">
                  Optional: phone (E.164)
                </Label>
                <Input
                  id="twilio-phone"
                  type="tel"
                  placeholder="+1234567890"
                  className="h-9 w-40 rounded-lg bg-input text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      const params: { fromNumber?: string } | undefined = input.value
                        ? { fromNumber: input.value }
                        : undefined
                      testTwilio.mutate(params)
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('twilio-phone') as HTMLInputElement | null
                  const params: { fromNumber?: string } | undefined =
                    input?.value != null && input.value !== ''
                      ? { fromNumber: input.value }
                      : undefined
                  testTwilio.mutate(params)
                }}
                disabled={testTwilio.isPending}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                {testTwilio.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send test SMS
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
