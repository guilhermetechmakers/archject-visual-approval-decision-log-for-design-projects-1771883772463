-- Two-Factor Authentication Schema
-- user_2fa_config, recovery_codes, otp_attempts for TOTP/SMS 2FA

-- 2FA method enum
CREATE TYPE public.two_fa_method AS ENUM ('totp', 'sms');

-- User 2FA configuration
CREATE TABLE IF NOT EXISTS public.user_2fa_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT FALSE,
  method two_fa_method,
  totp_secret TEXT,
  phone_number TEXT,
  phone_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery codes (hashed, single-use)
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP attempts (for rate limiting and fraud detection)
CREATE TABLE IF NOT EXISTS public.otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_2fa_config_user ON public.user_2fa_config(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user ON public.recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_used ON public.recovery_codes(user_id, used) WHERE NOT used;
CREATE INDEX IF NOT EXISTS idx_otp_attempts_user ON public.otp_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_attempts_created ON public.otp_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_attempts_user_created ON public.otp_attempts(user_id, created_at DESC);

-- RLS
ALTER TABLE public.user_2fa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- user_2fa_config: users can view own; service role for insert/update (Edge Functions)
CREATE POLICY "Users can view own 2fa config" ON public.user_2fa_config
  FOR SELECT USING (auth.uid() = user_id);

-- recovery_codes: users cannot read (service role only); no direct client access
-- Service role bypasses RLS for Edge Functions

-- otp_attempts: no direct client access; service role for insert/select
-- Service role bypasses RLS

-- Grant service role full access (implicit via bypass)
-- Users need SELECT on own user_2fa_config for status display
-- Edge Functions use service role for all 2FA operations
