-- Pending SMS OTP for 2FA enrollment (hashed, short-lived)
CREATE TABLE IF NOT EXISTS public.sms_otp_pending (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_otp_pending_expires ON public.sms_otp_pending(expires_at);

ALTER TABLE public.sms_otp_pending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only for sms_otp_pending" ON public.sms_otp_pending
  FOR ALL USING (false);
