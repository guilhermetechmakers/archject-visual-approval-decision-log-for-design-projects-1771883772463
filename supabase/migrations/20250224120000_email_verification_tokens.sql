-- Email verification tokens for secure, time-limited, single-use verification flow
-- Tokens are hashed before storage; never store plaintext tokens
-- Supports: initial verification, resend with rate limiting

-- Add last_verification_requested_at to profiles for rate limiting
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_verification_requested_at TIMESTAMPTZ;

-- Verification tokens table (similar pattern to password_reset_tokens)
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  token_jti TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_jti ON public.verification_tokens(token_jti);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON public.verification_tokens(token_hash);

-- RLS: Only service role can access (Edge Functions use service role)
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for verification_tokens" ON public.verification_tokens
  FOR ALL USING (false);
